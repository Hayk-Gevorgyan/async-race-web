import React, {
  FC, useState, useEffect, useCallback,
} from 'react';
import { WinnerWithCar } from '../../types/WinnerWithCar';
import { WinnerSortField } from '../../types/WinnerSortField';
import { SortOrder } from '../../types/SortOrder';
import { Pagination } from '../../components/Pagination';
import { Icon } from '../../components/Icon';
import Stack from '../../components/Stack';
import { getWinners } from '../../api/winners';
import { getCar } from '../../api/garage';
import { COLOR } from '../../styles/tokens';

const PAGE_SIZE = 10;

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  verticalAlign: 'middle',
};

export const WinnersView: FC = React.memo(() => {
  const [winners, setWinners] = useState<WinnerWithCar[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<WinnerSortField>('wins');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchPage = useCallback(async () => {
    const result = await getWinners({
      _page: currentPage,
      _limit: PAGE_SIZE,
      _sort: sortField,
      _order: sortOrder,
    });

    const cars = await Promise.all(result.data.map((w) => getCar(w.id)));

    const combined: WinnerWithCar[] = result.data.map((winner, i) => ({
      ...winner,
      ...cars[i],
    }));

    setWinners(combined);
    setTotalCount(result.total);
  }, [currentPage, sortField, sortOrder]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function handleSort(field: WinnerSortField) {
    if (field === sortField) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  }

  function sortIndicator(field: WinnerSortField) {
    if (field !== sortField) return ' ↕';
    return sortOrder === 'ASC' ? ' ↑' : ' ↓';
  }

  return (
    <Stack direction="column" alignItems="stretch" spacing={0}>
      <div style={{
        padding: '16px', color: COLOR.TEXT, fontSize: 20, fontWeight: 700, borderBottom: `2px solid ${COLOR.BORDER}`, background: COLOR.BG_BASE,
      }}
      >
        <Stack direction="row" alignItems="center" spacing={8}>
          <Icon name="trophy" size={20} color={COLOR.WARNING} />
          <span>
            Winners (
            {totalCount}
            )
          </span>
        </Stack>
      </div>

      {winners.length === 0 ? (
        <div style={{
          padding: 48, textAlign: 'center', color: COLOR.TEXT_DISABLED, fontSize: 18,
        }}
        >
          No winners yet
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', color: COLOR.TEXT, fontSize: 14,
          }}
          >
            <thead>
              <tr style={{ background: COLOR.BG_BASE, borderBottom: `2px solid ${COLOR.BORDER}` }}>
                <th style={thStyle}>№</th>
                <th style={thStyle}>Car</th>
                <th style={thStyle}>Name</th>
                <th
                  style={{ ...thStyle, cursor: 'pointer', color: sortField === 'wins' ? COLOR.PRIMARY : COLOR.TEXT }}
                  onClick={() => handleSort('wins')}
                >
                  Wins
                  {sortIndicator('wins')}
                </th>
                <th
                  style={{ ...thStyle, cursor: 'pointer', color: sortField === 'time' ? COLOR.PRIMARY : COLOR.TEXT }}
                  onClick={() => handleSort('time')}
                >
                  Best time (s)
                  {sortIndicator('time')}
                </th>
              </tr>
            </thead>
            <tbody>
              {winners.map((winner, index) => (
                <tr
                  key={winner.id}
                  style={{
                    borderBottom: `1px solid ${COLOR.BORDER}`,
                    background: index % 2 === 0 ? COLOR.BG_BASE : COLOR.BG_DEEP,
                  }}
                >
                  <td style={tdStyle}>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td style={tdStyle}>
                    <Icon name="car-top-view" size={32} color={winner.color} />
                  </td>
                  <td style={tdStyle}>{winner.name}</td>
                  <td style={tdStyle}>{winner.wins}</td>
                  <td style={tdStyle}>{winner.time.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </Stack>
  );
});
