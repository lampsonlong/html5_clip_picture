var canvasWidth = 200; // 画布宽度
var canvasHeight = 200; // 画布高度
var cvsBorder = 1; // 画布边框粗细
var cutWidth = 120;     // 裁剪框宽度
var cutHeight = 120;    // 裁剪框高度
var image = new Image(); // 上传图片
var dx = 0; // 裁剪框的横向移动位移
var dy = 0; // 裁剪框的纵向移动位移

$(document).ready(function(){
	// 画布初期化
	init();
	
	// 隐藏图片裁剪层
	$(".floatContainer").hide();
	
	// 绑定事件函数
	$('#hidUpload').bind("change",funcChange);
	$("#upload").bind("click", funcUploadClick);
});

image.onload = function() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	resizeAndDraw(context);

	$("#canvasDiv").css("width",canvasWidth + 2*cvsBorder); // 画布边框宽度补足
	$("#canvasDiv").css("height",canvasHeight + 2*cvsBorder); // 画布边框宽度补足
	$("#preCanvasDiv").css("width",cutWidth);
	$("#preCanvasDiv").css("height",cutHeight);
	
	// 预览画布初期内容显示
	funcClip(null,null);
};

function setImageURL(url){
    image.src=url;
}

// 把任意尺寸的图片缩放称长边等于画布边长的大小
function resizeAndDraw(context){
	var pW = image.width;	// 图片宽度
	var pH = image.height;	// 图片高度
	var cW = canvasWidth;	// 画布宽度
	var cH = canvasHeight;	// 画布高度
	var resize = 1;			// 图片缩放比例
	var midW = 0;			// 垂直居中位移
	var midH = 0;			// 水平居中位移
	
	// 上传图片宽大于等于高，则以宽度为长边进行缩放，短边做居中处理。
	if(pW >= pH){
		resize = cW/pW;
		
		pW = cW;
		pH = pH*resize;
		midH = (cH-pH)/2;
	} else {
		resize = cH/pH;
		
		pH = cH;
		pW = pW*resize;
		midW = (cW-pW)/2;
	}
	
	// 在上传图片显示画布中描绘缩放后的图片
	context.drawImage(image, midW, midH, pW, pH);
	
	// 显示图片裁剪层
	$(".floatContainer").show();
}

// 检查文件后缀名
function checkFile(f){
	if(f.name.toLowerCase().indexOf(".jpg")  == -1 &&
		f.name.toLowerCase().indexOf(".png") == -1 &&
		f.name.toLowerCase().indexOf(".jpeg") == -1) {
			return false;
	} else {
		return true;
	}
}

var funcChange = function(){
	// 获取文件
    var file=this.files[0];
    
    // 检查文件后缀名
    if(checkFile(file)){
    	$("#upload").unbind();
    } else {
    	alert("请上传jpg,jpeg,png格式的图片。");
    	return;
    }
    
    // 清空画布并重新初期化画布
    var canvas = document.getElementById("canvas");
    if (canvas){
    	$("#canvasDiv").html("");
    	$("#preCanvasDiv").html("");
    	init();
    }
    
    // 读取图片
    var reader = new FileReader();
    reader.onload = function(){
        // 通过 reader.result 来访问生成的 DataURL
        var url=reader.result;
        setImageURL(url);
    };
    reader.readAsDataURL(file);
}

// 上传图片按钮按下
var funcUploadClick = function(e){
	// 触发被隐藏的真实上传按钮点击事件
	var hidUpload = document.getElementById("hidUpload");
	if(hidUpload){
		hidUpload.click();
	}
	e.preventDefault();
}

// 取消按钮按下
function cancel(){
	// 重置上传控件（※此处为了解决上传相同图片无法触发change事件
	$("#hidden").html('<input type="file" id="hidUpload" name="img" />');
	
	// 重新绑定上传控件的change函数（※此处为了解决上传相同图片无法触发change事件
	$('#hidUpload').bind("change",funcChange);
	
	// 隐藏图片裁剪层
	$(".floatContainer").hide();
	
	// 绑定上传头像按钮点击事件
	$("#upload").bind("click", funcUploadClick);
}

// 确定按钮按下
function upToServer(){
	// 将预览画布导成URL
	var preCanvas = document.getElementById("preCanvas");
	var dataURL = preCanvas.toDataURL("image/png");
	
	// 显示该URL的图片
	$("#image").append('<img src="'+ dataURL +'">');
	
	// 隐藏裁剪层
	$(".floatContainer").hide();
	
	// 隐藏上传按钮
	$("#upload").hide();
}


// 各画布初期化
function init()
{
	// 裁剪框初期化
	var coverBox = document.createElement('canvas');
	coverBox.setAttribute('width', cutWidth);
	coverBox.setAttribute('height', cutHeight);
	coverBox.setAttribute('id', 'cover_box');
	coverBox.setAttribute('style', 'position:absolute;z-index:9999;border:1px solid black;');
	$('#canvasDiv').append(coverBox);
	if(typeof G_vmlCanvasManager != 'undefined') {
		coverBox = G_vmlCanvasManager.initElement(coverBox);
	}
	
    // 上传图片画布初期化
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvas.setAttribute('style', 'position:absolute;z-index:11;border:' + cvsBorder +'px solid black;');
	$('#canvasDiv').append(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d");
	
	// 预览画布初期化
	preCanvas = document.createElement('canvas');
	preCanvas.setAttribute('width', cutWidth);
	preCanvas.setAttribute('height', cutHeight);
	preCanvas.setAttribute('id', 'preCanvas');
	preCanvas.setAttribute('style', 'position:absolute;z-index:11;');
	$("#preCanvasDiv").append(preCanvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		preCanvas = G_vmlCanvasManager.initElement(preCanvas);
	}
	preContext = preCanvas.getContext("2d");
	
	// 裁剪框拖拽处理
	$("[id='cover_box']").draggable({ 
		containment: 'parent',	// 拖拽范围仅限上一层级
		helper:"orignal",		// 拖拽物随拖拽事件及时移动
		cursor: "move",			// 拖拽时鼠标Style变成移动模式
		stop: funcClip,			// 拖拽事件结束时触发该函数
	});
	
	// 浏览器窗口大小调整时触发该事件，重新定位裁剪框
	$(window).resize(function(event) {
		funcClip(event,null);
	});
}

// 重新描画裁剪框在画布中的位置，并在预览画布中显示裁剪框中的内容
var funcClip = function(event, ui){
	// 上传图片画布的位置
	var fx = $("#canvas").offset().left;
	var fy = $("#canvas").offset().top;
	
	// 拖拽事件触发时，拖动后裁剪框位置取得
	if(ui != undefined){
		dx = ui.position.left - fx;
		dy = ui.position.top - fy;
	}
	
	// 设定裁剪框位置
	$("#cover_box").css("left", fx + dx);
	$("#cover_box").css("top", fy + dy);
	
	// 在预览画布中描绘裁剪框区域内的图像
	var preCanvas = document.getElementById("preCanvas");
	var preContext = preCanvas.getContext('2d');
    preContext.drawImage(canvas,dx,dy,cutWidth,cutHeight,0,0,cutWidth,cutHeight);
}