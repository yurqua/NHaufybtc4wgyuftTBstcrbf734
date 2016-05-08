(function($, undefined){ 
	window.currentLessonInfoCardsIds =[];
	window.numberOfCards;
	//window.currentCardId = 0;
	var randomSuffix;
	var dragendInstance;
	
	function loadLessonData(callback, lessonToLoadNumber){//
		$.ajax({
			url: 'http://www.rebusmetod.com/wp-content/themes/whiteboard/deleteme/alternative/data.php',
			data: {lessonToLoad: lessonToLoadNumber -1} ,
			type: "GET",
			dataType: "html",
			success: function (data) {
				$('#notification').addClass('hidden');
				lessonObject = $.parseJSON( data );
				//console.log(lessonObject);
				callback(lessonObject);
			},
			error: function(xhr, textStatus, errorThrown ) {
				$('#notification').removeClass('hidden');
				$('#message').html('Помилка підключення. Повторна спроба за 5 секунд.');
				setTimeout(function(){
					$('#message').html('Підключення до інтернету...');
					setTimeout(function(){
						loadLessonData(callback);
					}, 1000);
				}, 5000);
			},
			abortOnRetry: true
		});
	}

	var renderLoadedLesson = function (retrivedLessonObject) {
		//console.log(retrivedLessonObject);
		window.currentLessonInfoCardsIds = [];
		//console.log('just flushed array: ' + currentLessonInfoCardsIds);
		window.numberOfCards = Object.keys(retrivedLessonObject["cards"]).length;
		$('.cards-wrapper').html('').append('<ul id="cards-ul">');
		$('#sound-script-container').html('');
		$.each(retrivedLessonObject, function(cardkey, card){
			if (cardkey != 'status') {
				$.each(card, function (propertykey, propertycontent) {
					if (propertycontent['cardType'] != "info-page") {
						var currentKeys         = 
							currentSyllables    = 
							currentBasicLetters = 
							currentQuizImages   = '';
						$.each(propertycontent['keys'], function(keyskey, keycontent){
							if (propertycontent['keys'].length > 8) {smallKeysClass = ' small-keys'} else {smallKeysClass = ''}
							if (keycontent[0] == "") {//склад
								currentKeys += '<li><span class="key-syllable lonely-key-syllable">' + keycontent[1] + '</span></li>';
							} else {//картинка
								currentKeys += '<li><img src="im/' + keycontent[0] + '.jpg" class="key-image' + smallKeysClass + '"><span class="key-syllable">' + keycontent[1] + '</span></li>';
							}
						})
						var noImagesWord = true;//перевіримо, чи слово без картинок
						$.each(propertycontent['word'], function(wordkey, wordcontent){
							if (wordcontent[0] != "") {
								noImagesWord = noImagesWord & false;
							}
						});
						var noImagesWordClass = '';
						if (noImagesWord) {
							noImagesWordClass = ' dont-raise-me';
						}
						$.each(propertycontent['word'], function(wordkey, wordcontent){
							//вирівнювання по центру
							var negativePercentMargin = {2:"2",3:"4",4:"9",5:"12"};
							if (wordkey == 0) {syllableStyle = 'style="margin:0 3% 0 -' + negativePercentMargin[+propertycontent['word'].length]+ '%"'} else {syllableStyle = ''}
							if (wordcontent[0] == "") {//склад
								currentSyllables += '<li class="big-syllable-li" ' + syllableStyle + '><span class="full-syllable big-syllable' + noImagesWordClass + '">' + wordcontent[1] + '</span></li>';
							} else {//картинка
								currentSyllables += '<li ' + syllableStyle + '><img src="im/' + wordcontent[0] + '.jpg" class="syllable-image"><span class="full-syllable">' + wordcontent[1] + '</span></li>';
							}
						})					
						$.each(propertycontent['basicLetters'], function(basicLetterskey, basicLetterscontent){
							currentBasicLetters += '<li id="li-' + basicLetterscontent[0] + '"><img src="im/' + basicLetterscontent[0] + '.jpg" class="basic-letters-image"><span class="basic-letters-syllable">' + basicLetterscontent[2] + '</span><span class="full-basic-letters">' + basicLetterscontent[1] + '</span></li>';
						})					
						$.each(propertycontent['quizCards'], function(quizCardskey, quizCardscontent){
							if (quizCardscontent[1].search('-correctanswer') != -1) {
								correctAnswerClass = ' class="correct-answer"';
							} else {
								correctAnswerClass = '';
							}
							currentQuizImages += '<li><img src="im/' + quizCardscontent[1].replace("-correctanswer","") + '.jpg" alt="' + quizCardscontent[0].replace("-correctanswer","") + '" title="' + quizCardscontent[0].replace("-correctanswer","") + '"' + correctAnswerClass + '></li>';
						})
						if (propertycontent['cardType'] == "basic-letters") {
							currentSyllables = "";
						}
						if (propertycontent['cardType'] == "read" ||propertycontent['cardType'] == "read-and-point") {
							lonelySyllablesClass = " lonely-syllables";
						} else {
							lonelySyllablesClass = "";
						}
						$('#cards-ul').append('<li class="container dragend-page"><div><div id="inner-card-' + (+propertykey +1) + '"><header>' + propertycontent['headerText'] + '</header><div class="ripple-effect close-button" data-ripple-color="#0695DF" data-ripple-limit="body">&nbsp;</div><div class="keys-center-wrapper"><ul class="keys">' + currentKeys + '</ul></div><ul class="syllables' + lonelySyllablesClass + '">' + currentSyllables + '</ul><div class="basic-letters-center-wrapper"><ul class="basic-letters">' + currentBasicLetters + '</ul></div><ul class="quiz-images vivid">' + currentQuizImages + '</ul></div></div></li>');
						if (propertycontent['soundScript'] != "") {
							$('#sound-script-container').append((unescape(propertycontent['soundScript'])));
							try {playSound();}catch(err) {console.log('err '+err);}
						}
					} else {//info-card
						$('#cards-ul').append('<li class="container dragend-page gray">' +
							'<span class="spinner"></span>' +
							'<div id="inner-card-' + (+propertykey +1) + '" class="hidden">' + propertycontent['pageContent'] + '</div>' +
						'</li>');
						window.currentLessonInfoCardsIds.push(propertykey);
						/*$('#cards-ul').append('<li class="container dragend-page scrollable"><div><div id="inner-card-' + (+propertykey +1) + '" class="info-card">' + propertycontent['pageContent'] + '</div></div></li>');*/
					}				
				})	
			}
		});
		console.log('current array content: ' + currentLessonInfoCardsIds);
		randomSuffix = Math.floor(Math.random() * Math.pow(10,15) + 1);//обходимо глюк плагіна, що ініціалізується лише один раз
		$(".cards-wrapper").attr("id","cards-wrapper-" + randomSuffix);
		$("#cards-wrapper-" + randomSuffix).dragend({afterInitialize: function() {
				this.container.style.visibility = "visible";
				dragendInstance = this;
			}
		});
		if (typeof playSound == 'function') { //якщо в уроці є звуки
			playSound(); 
		}
	}

	$(document).on('closeLesson', function( event) {		
		showLessonsPlan();
	});

	$(document).on('showTextCard', function( event, pageNumber) {
		//some code to update inner html
		$('#text-card').scrollTop(0);
		$('#text-card-content').html($('#inner-card-' + (+pageNumber +1)).html());
		$('#text-card').perfectScrollbar('update');
		$('#text-card').css({opacity: '1', marginTop: '0', position: 'static'});
		/*$('#text-card').animate({opacity: '1', top: '0'}, 50);*/
	});

	$(document).on('hideTextCard', function( event, pageNumber) {
		console.log('currentLessonInfoCardsIds.indexOf(pageNumber) ' + pageNumber + currentLessonInfoCardsIds.indexOf(pageNumber));
		if (currentLessonInfoCardsIds.indexOf(pageNumber) == -1) {
			$('#text-card').css({ opacity: 0, marginTop: '100%', position: 'absolute' });
		} else {
			$('#text-card').css({ opacity: '1', marginTop: '0', position: 'static' });
		}
	});
	
	goBack = function () {
		if (dragendInstance.page > 0) {
			dragendInstance.scrollToPage(dragendInstance.page);
		} else {
			$(document).trigger('hideTextCard', dragendInstance.page);		
			showLessonsPlan();
		}
		$(document).trigger('hideTextCard', dragendInstance.page);		
	}
	goForward = function() {
		if (dragendInstance.page + 2 <= window.numberOfCards) {
			dragendInstance.scrollToPage(dragendInstance.page + 2 );
		} else {
			showLessonsPlan();
		}
		$(document).trigger('hideTextCard', dragendInstance.page);
	}
	
	$('#back-arrow')   .on('mouseup', function(){goBack();});
	$('#forward-arrow').on('mouseup', function(){goForward();});
	$(document).keyup(function (event) {
		if (event.keyCode == 37 || event.keyCode == 33) {goBack();}
		if (event.keyCode == 39 || event.keyCode == 34) {goForward();}
	});
	
	var showLessonsPlan = function (){
		//console.log('x');
		$('#lessonsplan-wrapper').animate({
				height: "100%", 
				duration: "500", 
		},
			function(){
				$('#lessonsplan-wrapper').removeClass("hidden");
				$('nav').animate({opacity:0},100,function(){$('nav').addClass('hidden')});
				currentCardNumber = 1;
				$('.cards-wrapper').html('<ul><li class="dragend-page"></li></ul>');
				$('#text-card').css({opacity: '0', marginTop: '100%', position: 'absolute'});
				if (dragendInstance) dragendInstance.destroy();//боремо глюк із дочасним закриттям при перетягуванні картки на другому захо́ді на урок. І економимо пам'ять
			}
		);
	}

	$('#lessonsplan-lessonnumbers').mouseup(function (event) {
		nextLessonNumber = event.target.id.replace("lesson-button-","");
		loadLessonData(renderLoadedLesson, nextLessonNumber);
		$('#lessonsplan-wrapper').animate({
				height: "100%", 
				duration: "5", 
		},
			function(){
				$('nav').removeClass('hidden');
				$('nav').animate({opacity:1},1000,function(){});
				$('#lessonsplan-wrapper').css('marginTop', '0');
				$('#lessonsplan-wrapper').addClass("hidden");	
				//$('#cards-wrapper').dragend();
			}
		);
	});	

	$('body').on( 'click', '.close-button', function() {
		showLessonsPlan();
	});
	
	$('#text-card').perfectScrollbar({scrollYMarginOffset: 100});
	
})(jQuery);


/*
	
	
	привязать показ карточки к онСвайпЕнд
	
		  //и вообще, скопировать отсюда зис и попробовать к ней потом обращаться 
		  //this.jumpToPage(this.pages.length - 1 );
	    $("#demo").dragend({
        jumpToPage: 2,
        onSwipeEnd: function() {
          var first = this.pages[0],
              last = this.pages[this.pages.length - 1];

          if (first === this.activeElement) {
            this.jumpToPage(this.pages.length - 1 );
          }

          if (last === this.activeElement) {
            this.jumpToPage(2);
          }

        },
        afterInitialize: function() {
          this.container.style.visibility = "visible";
        }
      });
    });
	
	Запутался с переходом на страницу влево/вправо. Нормальная функция драгенда не работает
	$("#cards-wrapper-" + randomSuffix).dragend('right');
	Поэтому есть идея пойти через задницу и сделать 
		$("#cards-wrapper-" + randomSuffix).dragend({
			scrollToPage: 2
		}		
	т.к. такая шняга работает. странно как-то работает. потому что так страницы листает.
	
? Переверстать карточки с использованием флексбокса	(може допоможе при приховуванні відповідей)
• навісити переходи до наступних сторінок при натисканні синіх кнопок. врахувати випадкові айді
• навісити переходи до наступних сторінок при натисканні правильних відповідей
• навісити переходи до наступних сторінок при натисканні кнопок < >
• переробити медіа запити
• полагодити звук на всіх-всіх складах. спитати гугл щось типу cordova jacascript safari sound
• дозволити ховати відповіді і правильно вертикально вирівнювати вміст карток
• додати слухача і генерувати подію у функції _checkOverscroll, щоб повертатися до плану уроків
• втілити усі типи карток, подумати, чи потрібні літери на перших уроках
• requirejs
• cordova crosswalk phonegap ionix
• IAP. Можливо, делегувати. Restore IAP
• Переписати ДЖСОН локально (?)
• Пакунок повного курсу. ДЖСОН, картинки, звуки
• Верстка плану уроків
• Купити всі зображення. Знайти їх, купити, обрізати.
• Казки-історії
• lazy load для сайта
• coockies для пройдених уроків
• gruntjs
• minification
*/