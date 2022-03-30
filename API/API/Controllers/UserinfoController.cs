using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MySql.Data.MySqlClient;
using System.Collections;
using System.Text;
using Npgsql;
using API.Models;
using SqlSugar;
using System.Threading.Tasks;
using API.Helper;

namespace API.Controllers
{
    /// <summary>
    /// 用户管理
    /// </summary>
    public class UserinfoController : ApiController
    {
        public static SqlSugarClient DbContext = dbContext.CretClient();
        /// <summary>
        /// 判断用户名和密码是否正确
        /// </summary>
        ///<param name="username">用户名</param>
        ///<param name="password">密码</param>
        public MessageModel<UserInfo> Get(string username="", string password="")
        {
            var data = new MessageModel<UserInfo>();
            Expressionable<UserInfo> exp = Expressionable.Create<UserInfo>();
            if (!string.IsNullOrEmpty(username)&& !string.IsNullOrEmpty(password))
            {
                password = MD5Helper.GetMd5String(password);
                exp.And(it => it.UserName==username&&it.PassWord==password);
            }
            var result = DbContext.Queryable<UserInfo>()
                .Where(exp.ToExpression())
                .ToList();
            if (result.Count > 0) {
                data.status = 200;
                data.success = true;
                data.msg = "用户名、密码正确";
                data.response = result[0];
            }
            return data;

        }

    }
}