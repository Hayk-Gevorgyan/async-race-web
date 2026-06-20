import { PaginationQuery } from "./PaginationQuery";
import { WinnerSortField } from "./WinnerSortField";
import { SortOrder } from "./SortOrder";

export interface WinnersQuery extends PaginationQuery {
  _sort?: WinnerSortField;
  _order?: SortOrder;
}
