using Newtonsoft.Json;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MySql.Data.MySqlClient;
using System.Collections;
using System.Text;
using System.Threading.Tasks;
using API.Models;
using System.Collections.Generic;
using System.Web;
using SqlSugar;
using System.Diagnostics;
using System.Reflection;
using API.Helper;

namespace API.Controllers
{
    /// <summary>
    /// 数据管理
    /// </summary>
    public class Log4NetController : ApiController
    {
        public static SqlSugarClient DbContext = dbContext.CretClient();

        /// <summary>
        /// 获取日志(分页)
        /// </summary>
        ///<param name="page">当前页数</param>
        ///<param name="intPageSize">每页显示数据条数</param>
        ///<param name="key">查询条件</param>
        public async Task<MessageModel<object>> GetAsync(int page = 1, int intPageSize = 10, string key = "")
        {
            Expressionable<Log4net> exp = Expressionable.Create<Log4net>();
            if (!string.IsNullOrEmpty(key))
            {
                exp.And(it => it.log_message.Contains(key));
            }
            RefAsync<int> total = 0;
            var result = await DbContext.Queryable<Log4net>()
                .Where(exp.ToExpression())
                .ToPageListAsync(page, intPageSize, total);
            var model = new PageModel<Log4net>();
            model.dataCount = total;
            model.data = result;
            model.page = page;
            model.PageSize = intPageSize;
            return new MessageModel<object>()
            {
                msg = "获取成功",
                success = true,
                response = model
            };
        }


    }

}