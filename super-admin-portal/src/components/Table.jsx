import React from 'react';
import { Inbox } from 'lucide-react';

const Table = ({ columns, data, actions = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <Inbox className="empty-state-icon" />
                    <p className="empty-state-title">No data found</p>
                    <p className="empty-state-text">There are no records to display</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container overflow-x-auto">
            <table className="table">
                <thead className="table-header">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="table-body">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.render ? col.render(row) : row[col.accessor] || '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
