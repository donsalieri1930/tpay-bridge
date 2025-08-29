from pathlib import Path
from typing import AsyncGenerator, Annotated, TypeAlias, Any

from fastapi import Depends
from sqlalchemy import text, CursorResult
from sqlalchemy.ext.asyncio import create_async_engine, AsyncConnection

from settings import DATABASE_URI, BASE_DIR

engine = create_async_engine(DATABASE_URI, echo=False, pool_pre_ping=True)


async def get_connection() -> AsyncGenerator[AsyncConnection, None]:
    async with engine.begin() as connection:
        yield connection


ConnectionDep: TypeAlias = Annotated[AsyncConnection, Depends(get_connection)]


async def execute_sql_from_file(
        connection: AsyncConnection,
        query_file: str,
        sqlalchemy_kwargs: dict[str, Any] | None = None,
        query_dir='sql') -> CursorResult[Any]:
    """
    Execute an SQL query from a file.
    :param connection: SQLAlchemy async connection object
    :param query_file: Full file name of the query file
    :param sqlalchemy_kwargs: Parameters for the SQL query
    :param query_dir: Directory with query files, relative to BASE_DIR
    :return: SQLAlchemy CursorResult object.
    """

    sqlalchemy_kwargs_default = sqlalchemy_kwargs or {}
    query_path = BASE_DIR / query_dir / query_file
    query_string = Path(query_path).read_text().strip()
    return await connection.execute(text(query_string), sqlalchemy_kwargs_default)


async def query_and_cast[T: tuple](
        connection: AsyncConnection,
        query_file: str,
        row_type: type[T],
        sqlalchemy_kwargs: dict[str, Any] | None = None,
        query_dir='sql') -> list[T]:
    """
    Execute an SQL query, convert each row to a specified type.
    :param connection: SQLAlchemy async connection object
    :param query_file: Full file name of the query file
    :param row_type: A tuple subclass (NamedTuple recommended). The
        order of arguments must match the order of columns in the query.
    :param sqlalchemy_kwargs: Parameters for the SQL query
    :param query_dir: Directory with query files, relative to BASE_DIR
    :return: List of row objects
    """

    result = await execute_sql_from_file(connection, query_file, sqlalchemy_kwargs, query_dir)
    return [row_type(*row) for row in result.tuples().all()]

