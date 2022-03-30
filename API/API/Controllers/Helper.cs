using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Helper
{
    public class dbContext
    {
        private static SqlSugarClient _db = null;
        /// <summary>
        /// vue_test是数据库名
        /// </summary>                                          
        public static string ConnectionString = "server=localhost;uid=zydbuser;pwd=zydb.123;database=vue_test";
        public static SqlSugarClient CretClient()
        {
            _db = new SqlSugarClient(new ConnectionConfig()
            {
                ConnectionString = ConnectionString, //数据库连接字符串
                DbType = DbType.MySql, //必填
                IsAutoCloseConnection = false, //默认false
                InitKeyType = InitKeyType.Attribute
            });
            return _db;
        }
    }
}