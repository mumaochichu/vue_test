using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Models
{
	/// <summary>
	/// 日志类
	/// </summary>
	public class Log4net
	{
        /// <summary>
        /// 主键Id
        /// </summary>
        [SugarColumn(IsPrimaryKey = true)]
        public string Id { get; set; }
        /// <summary>
        /// 记录时间
        /// </summary>
        public DateTime log_datetime { get; set; }
        public string log_thread { get; set; }
        public string log_level { get; set; }
        public string log_logger { get; set; }
        public string log_message { get; set; }
        public string Exception { get; set; }
    }
}