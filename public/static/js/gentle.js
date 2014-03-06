function formHelper( $wrap ) {
	$($wrap).find(".scope").change(function(){
		$(this).parents("form").attr("method", "get").submit();
	});
	$($wrap).find('.g-datepicker').datetimepicker({
		language: 'zh-CN',
		weekStart: 1,
		todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
	});
	$($wrap).find('.g-datetimepicker').datetimepicker({
		language: 'zh-CN',
		weekStart: 1,
		todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		forceParse: 0,
		showMeridian: 1
	});
	$($wrap).find('.g-timepicker').datetimepicker({
		language: 'zh-CN',
		weekStart: 1,
		todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 1,
		minView: 0,
		maxView: 1,
		forceParse: 0
	});
}

(function(){
	//$("textarea.ueditor").each(function(){
	//	UE.getEditor(this, { initialFrameWidth: 600, initialContent: "" });
	//});

	//var $ids = $(".multi-form tr td input:checkbox[name^=ids]");
	//$(".multi-form tr th:eq(0) input:checkbox").click(function(){
	//	var checked = this.checked; 
	//	$ids.each(function(){
	//		this.checked = checked;
	//	});
	//});
	//$(".multi-action").click(function(){
	//	$(".multi-form").attr("action", this.value).submit();	
	//});
	//$(".multi-form").submit( function(){
	//	var $ids = $(".multi-form tr td input:checkbox[name^=ids]:checked");
	//	if( !$ids.length ) {
	//		alert( "请先选择数据" );
	//		return false;
	//	}
	//});

	//$(".truncate").popover({placement: "top", html: true});

	//var $modal = $('<div class="modal hide fade"></div>').appendTo("body");
	//$("a.ajax").click(function(){
	//	$('body').modalmanager('loading');
	//	var url  = $(this).attr("data-url") || $(this).attr("href");
	//	$modal.load(url, '', function(){
	//		$modal.modal();
	//		formHelper( $modal );
	//	});
	//	return false;
	//});
	formHelper( document );

	//$(".daterange").each(function(){
	//	$text = $(this).find(":text");
	//	$(this).find(".icon-calendar").click(function(){
	//		$text.focus();
	//	});
	//	$text.daterangepicker(
	//		{
	//			format: "yyyy-MM-dd",
	//			ranges: {
	//				'今天': ['today', 'tomorrow'],
	//				'本周': [Date.today().moveToDayOfWeek(0, -1), Date.today().moveToDayOfWeek(7, 1)],
	//				'昨天': ['yesterday', 'today'],
	//				'过去7天': [Date.today().add({ days: -6 }), 'tomorrow'],
	//				//'Last 30 Days': [Date.today().add({ days: -29 }), 'today'],
	//				'本月': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth().add({days: 1})],
	//				'上月': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }), Date.today().moveToFirstDayOfMonth()]
	//			},
	//			locale: {
	//				applyLabel: '确定',
	//				clearLabel:"清除",
	//				fromLabel: '从',
	//				toLabel: '到',
	//				weekLabel: 'W',
	//				customRangeLabel: '自定义',
	//				daysOfWeek: Date.CultureInfo.shortestDayNames,
	//				monthNames: Date.CultureInfo.monthNames,
	//				firstDay: 0
	//			}
	//		},
	//		function(start, end) {
	//			$text.parents("form").attr("method", "get").submit();
	//		}
	//	);
	//});

})();


