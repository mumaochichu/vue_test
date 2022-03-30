using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Models
{
    /// <summary>
    /// 数据管理数据类
    /// </summary>
    public class Data
    {
        /// <summary>
        /// 主键Id
        /// </summary>
        [SugarColumn(IsPrimaryKey = true)]
        public string Id { get; set; }
        /// <summary>
        /// 名称
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// X坐标
        /// </summary>
        public double? X { get; set; }
        /// <summary>
        /// Y坐标
        /// </summary>
        public double? Y { get; set; }
        /// <summary>
        /// 值
        /// </summary>
        public double? Num { get; set; }
        /// <summary>
        /// 附件
        /// </summary>
        public string Note { get; set; }
        /// <summary>
        /// 备注
        /// </summary>
        public string Attachment { get; set; }
        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime? CreateTime { get; set; }
        /// <summary>
        /// 更新时间
        /// </summary>
        public DateTime? UpdateTime { get; set; }
    }
}