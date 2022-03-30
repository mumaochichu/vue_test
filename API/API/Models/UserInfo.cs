using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Models
{
	public class UserInfo
	{
		/// <summary>
		/// id
		/// </summary>
		public string Id { get; set; }
		/// <summary>
		/// 用户名
		/// </summary>
		public string UserName { get; set; }
		/// <summary>
		/// 密码
		/// </summary>
		public string PassWord { get; set; }
	}
}