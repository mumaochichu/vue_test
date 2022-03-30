using System;
using System.Web.Http;
using API.Models;
using System.Web;
using System.IO;

namespace API.Controllers
{
	/// <summary>
	/// 图片管理
	/// </summary>
	public class ImgController : ApiController
	{
		/// <summary>
		/// 上传图片
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public MessageModel<string> PostAttachFiles()
		{
            string path;
			string returnPath;
            try
			{
				HttpRequest request = HttpContext.Current.Request;
				HttpFileCollection fileCollection = request.Files;
				// 判断是否有文件
				if (fileCollection.Count > 0)
				{
					HttpPostedFile httpPostedFile = fileCollection[0];
					// 获取文件扩展名
					string fileExtension = Path.GetExtension(httpPostedFile.FileName);
					string strHashData = DateTime.Now.ToString("yyyyMMddHHmmssffff");
					System.IO.Directory.CreateDirectory(AppDomain.CurrentDomain.BaseDirectory + "Img\\" + strHashData);
					// 设置上传路径
					path = AppDomain.CurrentDomain.BaseDirectory + "Img\\" + strHashData+ "\\"+httpPostedFile.FileName;
					returnPath= "Img\\" + strHashData + "\\" + httpPostedFile.FileName;
					httpPostedFile.SaveAs(path);
				}
				else
				{
					return new MessageModel<string>()
					{
						msg = "上传失败",
						success = false,
					};
				}
			}
			catch(Exception ex) {
				return new MessageModel<string>()
				{
					msg = "上传失败",
					success = false,
				};
			}
			return new MessageModel<string>()
			{
				msg = "上传成功",
				success = true,
				response = returnPath
			};
		}
	}

}
