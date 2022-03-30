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
using API.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using SqlSugar;
using API.Helper;

namespace API.Controllers
{
    /// <summary>
    /// 菜单栏
    /// </summary>
    public class MenuController : ApiController
    {
        public static SqlSugarClient DbContext = dbContext.CretClient();
        /// <summary>
        /// 获取菜单
        /// </summary>
        public async Task<MessageModel<object>> Get() {

            var result = DbContext.Queryable<Menu>()
                .ToListAsync();
            return await Task.FromResult(new MessageModel<object>()
            {
                status = 200,
                success = true,
                msg = "获取成功",
                response = result
            });
        }

        /// <summary>
        /// Post请求
        /// </summary>
        public void Post([FromBody] string value)
        {
        }

        /// <summary>
        /// Put请求
        /// </summary>
        public void Put(int id, [FromBody] string value)
        {
        }

        /// <summary>
        /// Delete请求
        /// </summary>
        public void Delete(int id)
        {
        }
    }
}