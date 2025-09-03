import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const ReportGrid = () => {
  const [rowData, setRowData] = useState([
    { id: 1, service: "ABC001", month: "Aug 2025", cost: 12345, penalty: 120 },
    { id: 2, service: "ABC002", month: "Aug 2025", cost: 8500, penalty: 0 }
  ]);

  const [columnDefs] = useState([
    { field: "id", headerName: "ID", sortable: true, filter: true },
    { field: "service", headerName: "Service No", editable: true },
    { field: "month", headerName: "Month", editable: true },
    { field: "cost", headerName: "Cost (₹)", editable: true },
    { field: "penalty", headerName: "PF Penalty (₹)", editable: true }
  ]);

  const addRow = () => {
    const newRow = {
      id: rowData.length + 1,
      service: "NEW",
      month: "Sep 2025",
      cost: 0,
      penalty: 0
    };
    setRowData([...rowData, newRow]);
  };

  const deleteRow = () => {
    if (rowData.length === 0) return;
    const updatedRows = [...rowData];
    updatedRows.pop();
    setRowData(updatedRows);
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        >
          ➕ Add Row
        </button>
        <button
          onClick={deleteRow}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow"
        >
          🗑 Delete Row
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5}
        />
      </div>
    </div>
  );
};

export default ReportGrid;
