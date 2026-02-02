"""
Database configuration for EAA Recruit.
Currently using file-based storage. Can be extended to use SQLAlchemy for database support.
"""

# Placeholder for database configuration
# This can be extended to include SQLAlchemy database setup when needed

DATABASE_URL = "sqlite:///./eaa_recruit.db"

# Example SQLAlchemy setup (commented out for now):
# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
#
# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()
#
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
