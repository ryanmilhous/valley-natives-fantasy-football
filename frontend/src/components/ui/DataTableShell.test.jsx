import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DataTableShell from './DataTableShell'

describe('DataTableShell', () => {
  it('renders header content, actions, and table children', () => {
    const { container } = render(
      <DataTableShell
        title="All-Time Standings"
        subtitle="Regular season records"
        actions={<button type="button">Export</button>}
      >
        <table>
          <tbody>
            <tr>
              <td>Oak Town</td>
            </tr>
          </tbody>
        </table>
      </DataTableShell>,
    )

    expect(screen.getByText('All-Time Standings')).toBeInTheDocument()
    expect(screen.getByText('Regular season records')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByText('Oak Town')).toBeInTheDocument()
    expect(container.querySelector('.vn-data-table-shell')).toBeTruthy()
    expect(container.querySelector('.vn-data-table-shell__scroll')).toBeTruthy()
  })

  it('renders empty state when empty prop is true', () => {
    render(
      <DataTableShell title="Season Matchups" empty emptyMessage="No matchups available" />,
    )

    expect(screen.getByText('No matchups available')).toBeInTheDocument()
  })
})
