import psycopg2;
import os;
import pymysql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


connection = pymysql.connect(
    host='quagga-3.cmyh8xooinlw.us-east-2.rds.amazonaws.com',
    port=3306,
    user='Randgriz',
    password='Vampire123!',
    database='QuaggaChess'
)