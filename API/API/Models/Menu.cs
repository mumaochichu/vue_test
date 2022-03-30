using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Models
{
	/// <summary>
	/// 菜单
	/// </summary>
	public class Menu
	{
		/// <summary>
		/// 节点id，主键
		/// </summary>
	   [SugarColumn(IsPrimaryKey = true)]
		public string Id { get; set; }
		/// <summary>
		/// 菜单名称
		/// </summary>
		public string Name { get; set; }
		/// <summary>
		/// 父节点id
		/// </summary>
		public string P_id { get; set; }
		/// <summary>
		/// 菜单图标
		/// </summary>
		public string Icon { get; set; }
		/// <summary>
		/// 路由
		/// </summary>
		public string Url { get; set; }
	}
	
}