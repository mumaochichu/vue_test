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
    public class DataController : ApiController
    {
        public static SqlSugarClient DbContext = dbContext.CretClient();

        /// <summary>
        /// 获取数据(分页)
        /// </summary>
        ///<param name="page">当前页数</param>
        ///<param name="intPageSize">每页显示数据条数</param>
        ///<param name="key">查询条件</param>
        public async Task<MessageModel<object>> GetAsync(int page = 1,int intPageSize=10,string key="")
        {
            //sql语句方式
            //string where = "1=1";
            //if (!string.IsNullOrEmpty(key))
            //{
            //    where = where + " " + "and" + " " + "Name like '%" + key + "%'";
            //}
            //string sql = "select * from Data WHERE " + where + " order by CreateTime desc,UpdateTime desc";
            //var result = ToList.ToDataList<Data>(dt);
            //var dt = DbContext.Ado.GetDataTable(sql);
            Expressionable<Data> exp = Expressionable.Create<Data>();
            if (!string.IsNullOrEmpty(key))
            {
                exp.And(it => it.Name.Contains(key));
            }
            RefAsync<int> total = 0;
            var result = await DbContext.Queryable<Data>()
                .Where(exp.ToExpression())
                .ToPageListAsync(page, intPageSize,total);
            var model = new PageModel<Data>();
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

        /// <summary>
        /// 获取全部数据
        /// </summary>
        /// <param name="key">查询条件</param>
        public async Task<MessageModel<object>> GetAll(string key = "")
        {
            Expressionable<Data> exp = Expressionable.Create<Data>();
            if (!string.IsNullOrEmpty(key))
            {
                exp.And(it => it.Name.Contains(key));
            }
            var result = DbContext.Queryable<Data>()
                .Where(exp.ToExpression())
                .ToList();
            return await Task.FromResult(new MessageModel<object>()
            {
                status = 200,
                success = true,
                msg = "获取成功",
                response = result
            });

        }

        /// <summary>
        /// 根据Id获取数据
        /// </summary>
        ///<param name="Id">编号</param>
        public async Task<MessageModel<object>> GetById(string Id="") {
            var result = DbContext.Queryable<Data>().Where(it => it.Id == Id)
                 .ToList();
            return await Task.FromResult(new MessageModel<object>()
            {
                status = 200,
                success = true,
                msg = "获取成功",
                response = result
            });
        }

        /// <summary>
        /// 新增数据
        /// </summary>
        ///<param name="request">一条数据</param>
        [HttpPost]
        public MessageModel<string> Post([FromBody] Data request)
        {
            var data = new MessageModel<string>();
            request.Id = Guid.NewGuid().ToString();
            request.CreateTime= DateTime.Now;
            //插入数据
            var id =  DbContext.Insertable(request).ExecuteCommand();
            //查询是否添加成功
            var success1 = DbContext.Queryable<Data>().Where(it => it.Id == request.Id)
                .ToList();
            data.success = success1.Count > 0;
            if (data.success)
            {
                data.response = id.ToString();
                data.msg = "添加成功";
                log4net.ILog log = log4net.LogManager.GetLogger("MyLogger");
                log.Info("Data"+"-"+"Add"+"-"+request.Id);
            }
            return data;
        }

        /// <summary>
        /// 编辑数据
        /// </summary>
        ///<param name="request">一条数据</param>
        [HttpPost]
        public MessageModel<string> Put([FromBody] Data request)
        {
            var data = new MessageModel<string>();
            request.UpdateTime = DateTime.Now;
            if (request.Id != null)
            {
                var id = DbContext.Updateable(request).ExecuteCommand();
                data.success = (id >0);
                if (data.success)
                {
                    data.msg = "更新成功";
                    data.response = id.ToString();
                    log4net.ILog log = log4net.LogManager.GetLogger("MyLogger");
                    log.Info("Data" + "-" + "Edit" + "-" + request.Id);
                }
            }
            return data;
        }

        /// <summary>
        /// 根据主键Id删除一条数据
        /// </summary>
        ///<param name="Id">编号</param>
        [HttpGet]
        public MessageModel<string> DeleteById(string Id="")
        {
            var data = new MessageModel<string>();
            var id=DbContext.Deleteable<Data>().In(Id).ExecuteCommand();
            data.success = (id > 0);
            if (data.success)
            {
                data.msg = "删除成功";
                data.response = id.ToString();
                log4net.ILog log = log4net.LogManager.GetLogger("MyLogger");
                log.Info("Data" + "-" + "Delete" + "-" + Id);
            }
            return data;
        }

        [HttpPost]
        public string uploadFile(HttpContext context)
        {
            HttpResponseMessage response = new HttpResponseMessage();
            string path1 = context.Request.Path;
            response.Content = new StringContent(path1);
            // 获取提交的文件
            return path1;

        }
    }

}