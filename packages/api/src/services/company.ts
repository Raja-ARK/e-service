import { db } from "@e-service/db";
import {
  and,
  count,
  eq,
  exists,
  or,
  type SQL,
} from "@e-service/db/drizzle/orm";
import { company, companyUser } from "@e-service/db/schema/company";
import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import {
  COMPANY_SELECTABLE_COLUMNS,
  COMPANY_SORT_FIELDS,
} from "../schema/company";
import type { CompanyGetInput, ListCompaniesInput } from "../types/company";
import { buildColumnsMask, buildWhereClause } from "../utils/filter";
import { buildOrderBy } from "../utils/sort";

function userLinkedToCompanyExists(userId: string): SQL {
  return exists(
    db
      .select()
      .from(companyUser)
      .where(
        and(
          eq(companyUser.companyId, company.id),
          eq(companyUser.userId, userId),
        ),
      ),
  );
}

export const listCompanies = async ({
  input,
  context,
}: {
  input: ListCompaniesInput;
  context: Context;
}) => {
  const session = context.session;
  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const {
    page,
    limit,
    filter,
    filterCondition,
    sort,
    select,
    withoutPagination,
  } = input;
  const columns = buildColumnsMask(select, COMPANY_SELECTABLE_COLUMNS);

  const conditions = filter
    ? [
        buildWhereClause(company.name, filter.name),
        buildWhereClause(company.nameAr, filter.nameAr),
        buildWhereClause(company.status, filter.status),
        buildWhereClause(company.statusAr, filter.statusAr),
      ].filter(Boolean)
    : [];

  const filterWhere =
    conditions.length > 0
      ? filterCondition === "and"
        ? and(...conditions)
        : or(...conditions)
      : undefined;

  const roleScopeWhere =
    session.user.role === "external"
      ? userLinkedToCompanyExists(session.user.id)
      : undefined;

  const where =
    roleScopeWhere && filterWhere
      ? and(roleScopeWhere, filterWhere)
      : (roleScopeWhere ?? filterWhere);

  if (withoutPagination) {
    const rows = await db.query.company.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (c) =>
        buildOrderBy(c, sort, COMPANY_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
    });
    const total = rows.length;
    return {
      data: rows,
      total,
      totalPages: 1,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    };
  }

  const offset = (page - 1) * limit;

  const [rows, [total]] = await Promise.all([
    db.query.company.findMany({
      ...(columns ? { columns } : {}),
      where,
      orderBy: (c) =>
        buildOrderBy(c, sort, COMPANY_SORT_FIELDS, {
          field: "createdAt",
          direction: "desc",
        }),
      limit,
      offset,
    }),
    db.select({ value: count() }).from(company).where(where),
  ]);

  const totalPages = Math.ceil((total?.value ?? 0) / limit);

  return {
    data: rows,
    total: total?.value ?? 0,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const getCompany = async ({
  input,
  context,
}: {
  input: CompanyGetInput;
  context: Context;
}) => {
  const session = context.session;
  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const { id, select } = input;
  const columns = buildColumnsMask(select, COMPANY_SELECTABLE_COLUMNS);

  const idWhere =
    session.user.role === "external"
      ? and(eq(company.id, id), userLinkedToCompanyExists(session.user.id))
      : eq(company.id, id);

  const found = await db.query.company.findFirst({
    ...(columns ? { columns } : {}),
    where: idWhere,
  });
  if (!found)
    throw new ORPCError("NOT_FOUND", { message: "Company not found" });
  return { company: found };
};
