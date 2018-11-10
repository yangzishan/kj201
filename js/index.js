//截取URL 获取reportId
function GetQueryString(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
};
var myReportId = GetQueryString('reportId');
var myopenId = GetQueryString('openId');


$('.my_view').css("display","none");
$('.load-overlay').css("display","block");

$.ajax({
	url : dataUrl + "/api/v1/reportIndex/analysisReport",
	type : "POST",
	dataType : 'json',
	data : {
	    reportId : myReportId,  //替换变量 myReportId
	    openId : myopenId
	},
	success: function(data){
		if(data.code == 200){
			$.ajax({
			url : dataUrl + "/api/v1/reportIndex/indexAll",
			type : "POST",
			dataType : 'json',
			data : {
			    reportId : myReportId,  //替换变量 myReportId
				openId : myopenId
			},
			success : function(indexData) {
				//alert('you get it')
				if(indexData.code == 201){
					window.location.href="payfor.html?reportId=" + myReportId + '&openId=' + myopenId;
				}else if(indexData.code == 200){
					var userId = indexData.data.userId;
					$('.my_view').css("display","block");
					$('.load-overlay').css("display","none");
					$("#appId").val(indexData.wxParameter.appId);
					$("#nonceStr").val(indexData.wxParameter.nonceStr);
					$("#signature").val(indexData.wxParameter.signature);
					$("#timestamp").val(indexData.wxParameter.timestamp);
					$("#age").val(indexData.data.indexPage.age);
					var myApp = new Vue({
					  el: '#appVUE',
					  data: {
					    totalScore: indexData.data.indexPage.totalScore, //全部得分
					   	inspectDate: indexData.data.indexPage.inspectDate, // 检测日期
					    ranking: indexData.data.indexPage.ranking, //排名
					    age: indexData.data.indexPage.age,//生理年龄
					  	reportStr: indexData.data.indexPage.reportStr, //生理年龄字句
					  	firstStr: indexData.data.indexPage.firstStr, //各个系统生理年龄
					  	sites: indexData.data.firstPages, //各个系统
					  	status: indexData.data.otherPages //身体状况
					  },
					  filters:{
				    	getSecondHref:function(val){
				            return 'second.html?reportId='+myReportId+'&userId='+userId+ '&targetFirstId=' + val 
				       	}
					  }
					  
					});
					//总得分环形进度效果
					var score = indexData.data.indexPage.totalScore;
					$('.circle').circleProgress({
					    value: score/100,
					    size: 140,
					    thickness: 5,
					    lineCap: 'round',
					    startAngle: Math.PI*1.5,
					    fill: { gradient: ["#fff", "#fff"] }
					}).on('circle-animation-progress', function(event, progress) {
					    $(this).find('strong').html(parseInt(score * progress));
					    $(this).find('i').html('总分');
				
					});
					
					//判断多少天复测
					if(score <= 86){
						$('#sugDay').text(7);
					}else if(score >= 87 && score <= 89){
						$('#sugDay').text(10);
					}else if(score >= 90 && score <= 91){
						$('#sugDay').text(15);
					}else if(score >= 92){
						$('#sugDay').text(20);
					}
					
					//判断生理年龄和排名没有的情况
					  if(indexData.data.indexPage.ranking == 0){
					  	$('.score_inf .inf-rk').empty();
					  };
					  if(indexData.data.indexPage.reportStr == ''){
					  	$('.slnl_d').remove();
					  }
					
					
					//index_tab切换
					$('.index_tab span').on("click",function(){
						$(this).addClass('on').siblings().removeClass('on');
						$('.indexShow').eq($(this).index()).css("display","block").siblings('.indexShow').css("display","none");
					});
					//系统介绍弹窗
					function showMask(){
						$('.v_overlay').css({"visibility":"visible","opacity":"1"});
						$(document).on('touchmove',function(e){
							e.preventDefault();//阻止滚动
						})
					}
					$('.zhibiao_c .c_li .pop').on("click",function(event){
						event.stopPropagation();
						showMask();
						$(this).next('.v_overlert').css({"visibility":"visible","opacity":"1"});
						return false;
					});
					$('.zhuangk_c .c_li .pop').on("click",function(event){
						event.stopPropagation();
						showMask();
						$(this).next('.v_overlert').css({"visibility":"visible","opacity":"1"});
						return false;
					});
					$('.v_overlay').click(function(){
						$('.v_overlay').css({"visibility":"hidden","opacity":"0"});
						$('.v_overlert').css({"visibility":"hidden","opacity":"0"});
						$(document).off("touchmove");
					});
					//第一个系统不显示
					$('.zhibiao_c .c_li:first').css("display","none");
					//身体状况程度条
					$('.zhuangk_c .c_li').each(function(){
						var ilev = 6 - parseInt($(this).find('.lev').text());
						$(this).find('.sta').find('i:lt('+ilev+')').addClass('on');
					})
					//酸碱度
					$('.zhuangk_c .c_li:last .sta').css("display","none");
					$('.zhuangk_c .c_li:last .sta2').css("display","inline-block");
					
					//跳转历史报告
					var userId = indexData.data.userId;
					$('#checkHistory').attr("href",dataUrl + "/wxUser/wxUserReport?jumpUrl=uiHistory&userId=" + userId + "&openId=" + myopenId + '&reportId=' + myReportId);
					//跳转用户设置
					$('#goSetUp').attr("href",dataUrl + "/wxUser/wxUserReport?jumpUrl=uiUser&userId=" + userId + '&reportId=' + myReportId);
				}else{
					alert('没获取到报告数据');
				}
			
			},
			error: function(xhr,status){
				alert("已解析但未获取到数据" + xhr.status + " " + xhr.statusText);
			}
			});
			
			
			$.ajax({
				url : dataUrl + "/api/v1/reportIndex/getImproves",
				type : "POST",
				dataType : 'json',
				data : {
				    reportId : myReportId  //替换变量 myReportId
				},
				success: function(improvesData){
					if(improvesData.code == 200){
						if(improvesData.data == null || improvesData.data.improves.length ==0){
							$('.score_inf .inf-sg').html('身体状况良好，请继续保持').removeAttr("href");
						}else{
							var improvesNum = improvesData.data.improves.length;
							$('.score_inf .inf-sg span').text(improvesNum);
							//跳转健康建议
							$('.score_inf .inf-sg').attr("href","proposal.html?reportId="+ myReportId);
						}
					}else{
						console.log('首页请求getImproves成功,但数据不正确')
					}

				},
				error: function(xhr,status){
					console.log("首页请求getImproves失败" + xhr.status + " " + xhr.statusText);
				}
			});
		}else if(data.code == 402){
			window.location.href="userInfor.html?reportId=" + myReportId+"&userId=" + data.data.userId + "&openId=" + myopenId;
		}else if(data.code == 405){
			window.location.href="userInfor.html?reportId=" + myReportId+"&openId=" + myopenId;
		}else if(data.code == 403){
			window.location.href="supAge.html?reportId=" + myReportId+"&userId=" + data.data.userId + "&openId=" + myopenId;
		}else{
			alert('没有解析到新报告' + data.msg);
		}
		
	},
	error: function(xhr,status){
		alert("错误提示： " + xhr.status + " " + xhr.statusText);
	}
});

			
    	