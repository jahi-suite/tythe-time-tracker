"""Repository pattern for time entry data access operations."""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from psycopg2.extras import Json

from ..core.constants import DatabaseConstants, PayRateType
from ..core.models import TimeEntry
from .connection import DatabaseConnection

logger = logging.getLogger(__name__)


class TimeEntryRepository:
    """Repository for time entry data access operations."""
    
    def __init__(self, db_connection: DatabaseConnection) -> None:
        """Initialize the repository with a database connection.
        
        Args:
            db_connection: Database connection instance.
        """
        self.db = db_connection
    
    def create_time_entry(
        self, 
        employee: str, 
        clock_in: datetime, 
        pay_rate_type: PayRateType,
        clock_out: Optional[datetime] = None
    ) -> TimeEntry:
        """Create a new time entry.
        
        Args:
            employee: Employee name.
            clock_in: Clock in time.
            pay_rate_type: Pay rate type for the entry.
            clock_out: Optional clock out time.
            
        Returns:
            The created TimeEntry instance.
            
        Raises:
            ValueError: If employee name is empty.
        """
        if not employee.strip():
            raise ValueError("Employee name cannot be empty")
        
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(f"""
                    INSERT INTO {DatabaseConstants.TIME_ENTRIES_TABLE} 
                    ({DatabaseConstants.EMPLOYEE_COLUMN}, {DatabaseConstants.CLOCK_IN_COLUMN}, 
                     {DatabaseConstants.CLOCK_OUT_COLUMN}, {DatabaseConstants.PAY_RATE_TYPE_COLUMN})
                    VALUES (%s, %s, %s, %s)
                    RETURNING {DatabaseConstants.ID_COLUMN}, {DatabaseConstants.CREATED_AT_COLUMN}
                """, (employee.strip(), clock_in, clock_out, pay_rate_type.value))
                
                entry_id, created_at = cursor.fetchone()
                
                return TimeEntry(
                    id=entry_id,
                    employee=employee.strip(),
                    clock_in=clock_in,
                    clock_out=clock_out,
                    pay_rate_type=pay_rate_type,
                    created_at=created_at
                )
        except Exception as e:
            logger.error(f"Failed to create time entry: {e}")
            raise
    
    def get_open_shift(self, employee: str) -> Optional[TimeEntry]:
        """Get the most recent open shift for an employee.
        
        Args:
            employee: Employee name.
            
        Returns:
            The open TimeEntry if found, None otherwise.
        """
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(f"""
                    SELECT {DatabaseConstants.ID_COLUMN}, {DatabaseConstants.EMPLOYEE_COLUMN},
                           {DatabaseConstants.CLOCK_IN_COLUMN}, {DatabaseConstants.CLOCK_OUT_COLUMN},
                           {DatabaseConstants.PAY_RATE_TYPE_COLUMN}, {DatabaseConstants.CREATED_AT_COLUMN}
                    FROM {DatabaseConstants.TIME_ENTRIES_TABLE}
                    WHERE LOWER({DatabaseConstants.EMPLOYEE_COLUMN}) = LOWER(%s) 
                    AND {DatabaseConstants.CLOCK_OUT_COLUMN} IS NULL
                    ORDER BY {DatabaseConstants.CLOCK_IN_COLUMN} DESC
                    LIMIT 1
                """, (employee.strip(),))
                
                row = cursor.fetchone()
                if row:
                    return self._row_to_time_entry(row)
                return None
        except Exception as e:
            logger.error(f"Failed to get open shift: {e}")
            raise
    
    def close_shift(self, entry_id: UUID, clock_out: datetime) -> TimeEntry:
        """Close a time entry by setting the clock out time.
        
        Args:
            entry_id: The ID of the time entry to close.
            clock_out: The clock out time.
            
        Returns:
            The updated TimeEntry instance.
            
        Raises:
            ValueError: If the time entry is not found.
        """
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(f"""
                    UPDATE {DatabaseConstants.TIME_ENTRIES_TABLE}
                    SET {DatabaseConstants.CLOCK_OUT_COLUMN} = %s
                    WHERE {DatabaseConstants.ID_COLUMN} = %s
                    RETURNING {DatabaseConstants.ID_COLUMN}, {DatabaseConstants.EMPLOYEE_COLUMN},
                             {DatabaseConstants.CLOCK_IN_COLUMN}, {DatabaseConstants.CLOCK_OUT_COLUMN},
                             {DatabaseConstants.PAY_RATE_TYPE_COLUMN}, {DatabaseConstants.CREATED_AT_COLUMN}
                """, (clock_out, entry_id))
                
                row = cursor.fetchone()
                if not row:
                    raise ValueError(f"Time entry with ID {entry_id} not found")
                
                return self._row_to_time_entry(row)
        except Exception as e:
            logger.error(f"Failed to close shift: {e}")
            raise
    
    def get_employee_timesheet(
        self, 
        employee: str, 
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[TimeEntry]:
        """Get timesheet entries for a specific employee.
        
        Args:
            employee: Employee name.
            start_date: Optional start date filter.
            end_date: Optional end date filter.
            
        Returns:
            List of TimeEntry instances.
        """
        try:
            with self.db.get_cursor() as cursor:
                query = f"""
                    SELECT {DatabaseConstants.ID_COLUMN}, {DatabaseConstants.EMPLOYEE_COLUMN},
                           {DatabaseConstants.CLOCK_IN_COLUMN}, {DatabaseConstants.CLOCK_OUT_COLUMN},
                           {DatabaseConstants.PAY_RATE_TYPE_COLUMN}, {DatabaseConstants.CREATED_AT_COLUMN}
                    FROM {DatabaseConstants.TIME_ENTRIES_TABLE}
                    WHERE LOWER({DatabaseConstants.EMPLOYEE_COLUMN}) = LOWER(%s)
                """
                params = [employee.strip()]
                
                if start_date:
                    query += f" AND DATE({DatabaseConstants.CLOCK_IN_COLUMN}) >= %s"
                    params.append(start_date.date())
                
                if end_date:
                    query += f" AND DATE({DatabaseConstants.CLOCK_IN_COLUMN}) <= %s"
                    params.append(end_date.date())
                
                query += f" ORDER BY {DatabaseConstants.CLOCK_IN_COLUMN} DESC"
                
                cursor.execute(query, params)
                rows = cursor.fetchall()
                
                return [self._row_to_time_entry(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to get employee timesheet: {e}")
            raise
    
    def get_all_timesheets(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[TimeEntry]:
        """Get all timesheet entries with optional date filters.
        
        Args:
            start_date: Optional start date filter.
            end_date: Optional end date filter.
            
        Returns:
            List of TimeEntry instances.
        """
        try:
            with self.db.get_cursor() as cursor:
                query = f"""
                    SELECT {DatabaseConstants.ID_COLUMN}, {DatabaseConstants.EMPLOYEE_COLUMN},
                           {DatabaseConstants.CLOCK_IN_COLUMN}, {DatabaseConstants.CLOCK_OUT_COLUMN},
                           {DatabaseConstants.PAY_RATE_TYPE_COLUMN}, {DatabaseConstants.CREATED_AT_COLUMN}
                    FROM {DatabaseConstants.TIME_ENTRIES_TABLE}
                    WHERE 1=1
                """
                params = []
                
                if start_date:
                    query += f" AND DATE({DatabaseConstants.CLOCK_IN_COLUMN}) >= %s"
                    params.append(start_date.date())
                
                if end_date:
                    query += f" AND DATE({DatabaseConstants.CLOCK_IN_COLUMN}) <= %s"
                    params.append(end_date.date())
                
                query += f" ORDER BY {DatabaseConstants.CLOCK_IN_COLUMN} DESC"
                
                cursor.execute(query, params)
                rows = cursor.fetchall()
                
                return [self._row_to_time_entry(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to get all timesheets: {e}")
            raise
    
    def get_time_entry_by_id(self, entry_id: UUID) -> Optional[TimeEntry]:
        """Get a time entry by its ID.
        
        Args:
            entry_id: The ID of the time entry.
            
        Returns:
            The TimeEntry if found, None otherwise.
        """
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(f"""
                    SELECT {DatabaseConstants.ID_COLUMN}, {DatabaseConstants.EMPLOYEE_COLUMN},
                           {DatabaseConstants.CLOCK_IN_COLUMN}, {DatabaseConstants.CLOCK_OUT_COLUMN},
                           {DatabaseConstants.PAY_RATE_TYPE_COLUMN}, {DatabaseConstants.CREATED_AT_COLUMN}
                    FROM {DatabaseConstants.TIME_ENTRIES_TABLE}
                    WHERE {DatabaseConstants.ID_COLUMN} = %s
                """, (entry_id,))
                
                row = cursor.fetchone()
                if row:
                    return self._row_to_time_entry(row)
                return None
        except Exception as e:
            logger.error(f"Failed to get time entry by ID: {e}")
            raise
    
    def update_time_entry(
        self,
        entry_id: UUID,
        employee: str,
        clock_in: datetime,
        clock_out: Optional[datetime],
        pay_rate_type: PayRateType
    ) -> TimeEntry:
        """Update an existing time entry.
        
        Args:
            entry_id: The ID of the time entry to update.
            employee: Updated employee name.
            clock_in: Updated clock in time.
            clock_out: Updated clock out time.
            pay_rate_type: Updated pay rate type.
            
        Returns:
            The updated TimeEntry instance.
            
        Raises:
            ValueError: If the time entry is not found.
        """
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(f"""
                    UPDATE {DatabaseConstants.TIME_ENTRIES_TABLE}
                    SET {DatabaseConstants.EMPLOYEE_COLUMN} = %s,
                        {DatabaseConstants.CLOCK_IN_COLUMN} = %s,
                        {DatabaseConstants.CLOCK_OUT_COLUMN} = %s,
                        {DatabaseConstants.PAY_RATE_TYPE_COLUMN} = %s
                    WHERE {DatabaseConstants.ID_COLUMN} = %s
                    RETURNING {DatabaseConstants.ID_COLUMN}, {DatabaseConstants.EMPLOYEE_COLUMN},
                             {DatabaseConstants.CLOCK_IN_COLUMN}, {DatabaseConstants.CLOCK_OUT_COLUMN},
                             {DatabaseConstants.PAY_RATE_TYPE_COLUMN}, {DatabaseConstants.CREATED_AT_COLUMN}
                """, (employee.strip(), clock_in, clock_out, pay_rate_type.value, entry_id))
                
                row = cursor.fetchone()
                if not row:
                    raise ValueError(f"Time entry with ID {entry_id} not found")
                
                return self._row_to_time_entry(row)
        except Exception as e:
            logger.error(f"Failed to update time entry: {e}")
            raise
    
    def delete_time_entry(self, entry_id: UUID) -> bool:
        """Delete a time entry.
        
        Args:
            entry_id: The ID of the time entry to delete.
            
        Returns:
            True if the entry was deleted, False if not found.
        """
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(f"""
                    DELETE FROM {DatabaseConstants.TIME_ENTRIES_TABLE}
                    WHERE {DatabaseConstants.ID_COLUMN} = %s
                """, (entry_id,))
                
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to delete time entry: {e}")
            raise

    def insert_audit_log(
        self,
        action: str,
        target_table: str,
        target_id: Optional[UUID],
        changed_by: str,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Insert an audit log record and return key fields."""
        try:
            with self.db.get_cursor() as cursor:
                cursor.execute(
                    f"""
                    INSERT INTO {DatabaseConstants.AUDIT_LOG_TABLE}
                        (action, target_table, target_id, changed_by, old_values, new_values)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, created_at
                    """,
                    (
                        action,
                        target_table,
                        target_id,
                        changed_by.strip(),
                        Json(old_values) if old_values is not None else None,
                        Json(new_values) if new_values is not None else None,
                    ),
                )
                row = cursor.fetchone()
                if row is None:
                    raise RuntimeError("Failed to insert audit log")
                audit_id, created_at = row
                return {"id": audit_id, "created_at": created_at}
        except Exception as e:
            logger.error(f"Failed to insert audit log: {e}")
            raise

    def get_audit_logs(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Query audit log records with optional filters.

        Supported filters: action, target_table, target_id, changed_by,
        start_date, end_date, limit.
        """
        filters = filters or {}
        try:
            with self.db.get_cursor() as cursor:
                query = f"""
                    SELECT id, action, target_table, target_id, changed_by,
                           old_values, new_values, created_at
                    FROM {DatabaseConstants.AUDIT_LOG_TABLE}
                    WHERE 1=1
                """
                params: List[Any] = []

                if filters.get("action"):
                    query += " AND action = %s"
                    params.append(filters["action"])
                if filters.get("target_table"):
                    query += " AND target_table = %s"
                    params.append(filters["target_table"])
                if filters.get("target_id"):
                    query += " AND target_id = %s"
                    params.append(filters["target_id"])
                if filters.get("changed_by"):
                    query += " AND changed_by = %s"
                    params.append(filters["changed_by"])
                if filters.get("start_date"):
                    query += " AND created_at >= %s"
                    params.append(filters["start_date"])
                if filters.get("end_date"):
                    query += " AND created_at <= %s"
                    params.append(filters["end_date"])

                query += " ORDER BY created_at DESC"
                if filters.get("limit"):
                    query += " LIMIT %s"
                    params.append(int(filters["limit"]))

                cursor.execute(query, params)
                rows = cursor.fetchall()

                return [
                    {
                        "id": row[0],
                        "action": row[1],
                        "target_table": row[2],
                        "target_id": row[3],
                        "changed_by": row[4],
                        "old_values": row[5],
                        "new_values": row[6],
                        "created_at": row[7],
                    }
                    for row in rows
                ]
        except Exception as e:
            logger.error(f"Failed to get audit logs: {e}")
            raise
    
    def _row_to_time_entry(self, row: tuple) -> TimeEntry:
        """Convert a database row to a TimeEntry instance.
        
        Args:
            row: Database row tuple.
            
        Returns:
            TimeEntry instance.
        """
        entry_id, employee, clock_in, clock_out, pay_rate_type, created_at = row
        return TimeEntry(
            id=entry_id,
            employee=employee,
            clock_in=clock_in,
            clock_out=clock_out,
            pay_rate_type=PayRateType(pay_rate_type),
            created_at=created_at
        ) 
