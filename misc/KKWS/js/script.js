"use strict";
(function () {
	// Global variables
	let
			userAgent = navigator.userAgent.toLowerCase(),
			isIE = userAgent.indexOf("msie") !== -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") !== -1 ? 11 : userAgent.indexOf("edge") !== -1 ? 12 : false;

	// Unsupported browsers
	if (isIE !== false && isIE < 12) {
		console.warn("[Core] detected IE" + isIE + ", load alert");
		var script = document.createElement("script");
		script.src = "./js/support.js";
		document.querySelector("head").appendChild(script);
	}

	let
			initialDate = new Date(),

			$document = $(document),
			$window = $(window),
			$html = $("html"),
			$body = $("body"),

			isDesktop = $html.hasClass("desktop"),
			isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
			windowReady = false,
			isNoviBuilder = false,
			livedemo = false,

			plugins = {
				bootstrapTabs:           $('.tabs-custom'),
				bootstrapDateTimePicker: $( '[data-time-picker]' ),
				captcha:                 $('.recaptcha'),
				copyrightYear:           $('.copyright-year'),
				checkbox:                $('input[type="checkbox"]'),
				lightGallery:            $('[data-lightgallery="group"]'),
				lightGalleryItem:        $('[data-lightgallery="item"]'),
				lightDynamicGalleryItem: $('[data-lightgallery="dynamic"]'),
				owl:                     $('.owl-carousel'),
				preloader:               $('.preloader'),
				rdNavbar:                $('.rd-navbar'),
				rdMailForm:              $('.rd-mailform'),
				rdInputLabel:            $('.form-label'),
				regula:                  $('[data-constraints]'),
				radio:                   $('input[type="radio"]'),
				swiper:                  $('.swiper-container'),
				search:                  $('.rd-search'),
				searchResults:           $('.rd-search-results'),
				wow:                     $('.wow')
			};

	/**
	 * @desc Check the element was been scrolled into the view
	 * @param {object} elem - jQuery object
	 * @return {boolean}
	 */
	function isScrolledIntoView(elem) {
		if (isNoviBuilder) return true;
		return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
	}

	/**
	 * @desc Calls a function when element has been scrolled into the view
	 * @param {object} element - jQuery object
	 * @param {function} func - init function
	 */
	function lazyInit(element, func) {
		let scrollHandler = function () {
			if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
				func.call(element);
				element.addClass('lazy-loaded');
			}
		};

		scrollHandler();
		$window.on('scroll', scrollHandler);
	}

	// Initialize scripts that require a loaded window
	$window.on('load', function () {
		// Page loader & Page transition
		if (plugins.preloader.length && !isNoviBuilder) {
			pageTransition({
				target:            document.querySelector('.page'),
				delay:             0,
				duration:          500,
				classIn:           'fadeIn',
				classOut:          'fadeOut',
				classActive:       'animated',
				conditions:        function (event, link) {
					return link && !/(\#|javascript:void\(0\)|callto:|tel:|mailto:|:\/\/)/.test(link) && !event.currentTarget.hasAttribute('data-lightgallery');
				},
				onTransitionStart: function (options) {
					setTimeout(function () {
						plugins.preloader.removeClass('loaded');
					}, options.duration * .75);
				},
				onReady:           function () {
					plugins.preloader.addClass('loaded');
					windowReady = true;
				}
			});
		}
	});

	// Initialize scripts that require a finished document
	$(function () {
		isNoviBuilder = window.xMode;

		/**
		 * Wrapper to eliminate json errors
		 * @param {string} str - JSON string
		 * @returns {object} - parsed or empty object
		 */
		function parseJSON ( str ) {
			try {
				if ( str )  return JSON.parse( str );
				else return {};
			} catch ( error ) {
				return {};
			}
		}

		/**
		 * @desc Sets the actual previous index based on the position of the slide in the markup. Should be the most recent action.
		 * @param {object} swiper - swiper instance
		 */
		function setRealPrevious(swiper) {
			let element = swiper.$wrapperEl[0].children[swiper.activeIndex];
			swiper.realPrevious = Array.prototype.indexOf.call(element.parentNode.children, element);
		}

		/**
		 * @desc Sets slides background images from attribute 'data-slide-bg'
		 * @param {object} swiper - swiper instance
		 */
		function setBackgrounds(swiper) {
			let swipersBg = swiper.el.querySelectorAll('[data-slide-bg]');

			for (let i = 0; i < swipersBg.length; i++) {
				let swiperBg = swipersBg[i];
				swiperBg.style.backgroundImage = 'url(' + swiperBg.getAttribute('data-slide-bg') + ')';
			}
		}

		/**
		 * @desc Animate captions on active slides
		 * @param {object} swiper - swiper instance
		 */
		function initCaptionAnimate(swiper) {
			let
					animate = function (caption) {
						return function () {
							let duration;
							if (duration = caption.getAttribute('data-caption-duration')) caption.style.animationDuration = duration + 'ms';
							caption.classList.remove('not-animated');
							caption.classList.add(caption.getAttribute('data-caption-animate'));
							caption.classList.add('animated');
						};
					},
					initializeAnimation = function (captions) {
						for (let i = 0; i < captions.length; i++) {
							let caption = captions[i];
							caption.classList.remove('animated');
							caption.classList.remove(caption.getAttribute('data-caption-animate'));
							caption.classList.add('not-animated');
						}
					},
					finalizeAnimation = function (captions) {
						for (let i = 0; i < captions.length; i++) {
							let caption = captions[i];
							if (caption.getAttribute('data-caption-delay')) {
								setTimeout(animate(caption), Number(caption.getAttribute('data-caption-delay')));
							} else {
								animate(caption)();
							}
						}
					};

			// Caption parameters
			swiper.params.caption = {
				animationEvent: 'slideChangeTransitionEnd'
			};

			initializeAnimation(swiper.$wrapperEl[0].querySelectorAll('[data-caption-animate]'));
			finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));

			if (swiper.params.caption.animationEvent === 'slideChangeTransitionEnd') {
				swiper.on(swiper.params.caption.animationEvent, function () {
					initializeAnimation(swiper.$wrapperEl[0].children[swiper.previousIndex].querySelectorAll('[data-caption-animate]'));
					finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));
				});
			} else {
				swiper.on('slideChangeTransitionEnd', function () {
					initializeAnimation(swiper.$wrapperEl[0].children[swiper.previousIndex].querySelectorAll('[data-caption-animate]'));
				});

				swiper.on(swiper.params.caption.animationEvent, function () {
					finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));
				});
			}
		}

		/**
		 * @desc Create live search results
		 * @param {object} options
		 */
		function liveSearch(options, handler) {
			$('#' + options.live).removeClass('cleared').html();
			options.current++;
			options.spin.addClass('loading');
			$.get(handler, {
				s:          decodeURI(options.term),
				liveSearch: options.live,
				dataType:   "html",
				liveCount:  options.liveCount,
				filter:     options.filter,
				template:   options.template
			}, function (data) {
				options.processed++;
				let live = $('#' + options.live);
				if ((options.processed === options.current) && !live.hasClass('cleared')) {
					live.find('> #search-results').removeClass('active');
					live.html(data);
					setTimeout(function () {
						live.find('> #search-results').addClass('active');
					}, 50);
				}
				options.spin.parents('.rd-search').find('.input-group-addon').removeClass('loading');
			})
		}

		/**
		 * @desc Attach form validation to elements
		 * @param {object} elements - jQuery object
		 */
		function attachFormValidator(elements) {
			// Custom validator - phone number
			regula.custom({
				name:           'PhoneNumber',
				defaultMessage: 'Invalid phone number format',
				validator:      function () {
					if (this.value === '') return true;
					else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test(this.value);
				}
			});

			for (let i = 0; i < elements.length; i++) {
				let o = $(elements[i]), v;
				o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
				v = o.parent().find(".form-validation");
				if (v.is(":last-child")) o.addClass("form-control-last-child");
			}

			elements.on('input change propertychange blur', function (e) {
				let $this = $(this), results;

				if (e.type !== "blur") if (!$this.parent().hasClass("has-error")) return;
				if ($this.parents('.rd-mailform').hasClass('success')) return;

				if ((results = $this.regula('validate')).length) {
					for (let i = 0; i < results.length; i++) {
						$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
					}
				} else {
					$this.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}).regula('bind');

			let regularConstraintsMessages = [
				{
					type:       regula.Constraint.Required,
					newMessage: "The text field is required."
				},
				{
					type:       regula.Constraint.Email,
					newMessage: "The email is not a valid email."
				},
				{
					type:       regula.Constraint.Numeric,
					newMessage: "Only numbers are required"
				},
				{
					type:       regula.Constraint.Selected,
					newMessage: "Please choose an option."
				}
			];


			for (let i = 0; i < regularConstraintsMessages.length; i++) {
				let regularConstraint = regularConstraintsMessages[i];

				regula.override({
					constraintType: regularConstraint.type,
					defaultMessage: regularConstraint.newMessage
				});
			}
		}

		/**
		 * @desc Check if all elements pass validation
		 * @param {object} elements - object of items for validation
		 * @param {object} captcha - captcha object for validation
		 * @return {boolean}
		 */
		function isValidated(elements, captcha) {
			let results, errors = 0;

			if (elements.length) {
				for (let j = 0; j < elements.length; j++) {

					let $input = $(elements[j]);
					if ((results = $input.regula('validate')).length) {
						for (let k = 0; k < results.length; k++) {
							errors++;
							$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
						}
					} else {
						$input.siblings(".form-validation").text("").parent().removeClass("has-error")
					}
				}

				if (captcha) {
					if (captcha.length) {
						return validateReCaptcha(captcha) && errors === 0
					}
				}

				return errors === 0;
			}
			return true;
		}

		/**
		 * @desc Validate google reCaptcha
		 * @param {object} captcha - captcha object for validation
		 * @return {boolean}
		 */
		function validateReCaptcha(captcha) {
			let captchaToken = captcha.find('.g-recaptcha-response').val();

			if (captchaToken.length === 0) {
				captcha
				.siblings('.form-validation')
				.html('Please, prove that you are not robot.')
				.addClass('active');
				captcha
				.closest('.form-wrap')
				.addClass('has-error');

				captcha.on('propertychange', function () {
					let $this = $(this),
							captchaToken = $this.find('.g-recaptcha-response').val();

					if (captchaToken.length > 0) {
						$this
						.closest('.form-wrap')
						.removeClass('has-error');
						$this
						.siblings('.form-validation')
						.removeClass('active')
						.html('');
						$this.off('propertychange');
					}
				});

				return false;
			}

			return true;
		}

		/**
		 * @desc Initialize Google reCaptcha
		 */
		window.onloadCaptchaCallback = function () {
			for (let i = 0; i < plugins.captcha.length; i++) {
				let
						$captcha = $(plugins.captcha[i]),
						resizeHandler = (function () {
							let
									frame = this.querySelector('iframe'),
									inner = this.firstElementChild,
									inner2 = inner.firstElementChild,
									containerRect = null,
									frameRect = null,
									scale = null;

							inner2.style.transform = '';
							inner.style.height = 'auto';
							inner.style.width = 'auto';

							containerRect = this.getBoundingClientRect();
							frameRect = frame.getBoundingClientRect();
							scale = containerRect.width / frameRect.width;

							if (scale < 1) {
								inner2.style.transform = 'scale(' + scale + ')';
								inner.style.height = (frameRect.height * scale) + 'px';
								inner.style.width = (frameRect.width * scale) + 'px';
							}
						}).bind(plugins.captcha[i]);

				grecaptcha.render(
						$captcha.attr('id'),
						{
							sitekey:  $captcha.attr('data-sitekey'),
							size:     $captcha.attr('data-size') ? $captcha.attr('data-size') : 'normal',
							theme:    $captcha.attr('data-theme') ? $captcha.attr('data-theme') : 'light',
							callback: function () {
								$('.recaptcha').trigger('propertychange');
							}
						}
				);

				$captcha.after("<span class='form-validation'></span>");

				if (plugins.captcha[i].hasAttribute('data-auto-size')) {
					resizeHandler();
					window.addEventListener('resize', resizeHandler);
				}
			}
		};

		/**
		 * @desc Initialize the gallery with set of images
		 * @param {object} itemsToInit - jQuery object
		 * @param {string} [addClass] - additional gallery class
		 */
		function initLightGallery(itemsToInit, addClass) {
			if (!isNoviBuilder) {
				$(itemsToInit).lightGallery({
					thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
					selector:  "[data-lightgallery='item']",
					autoplay:  $(itemsToInit).attr("data-lg-autoplay") === "true",
					pause:     parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
					addClass:  addClass,
					mode:      $(itemsToInit).attr("data-lg-animation") || "lg-slide",
					loop:      $(itemsToInit).attr("data-lg-loop") !== "false"
				});
			}
		}

		/**
		 * @desc Initialize the gallery with dynamic addition of images
		 * @param {object} itemsToInit - jQuery object
		 * @param {string} [addClass] - additional gallery class
		 */
		function initDynamicLightGallery(itemsToInit, addClass) {
			if (!isNoviBuilder) {
				$(itemsToInit).on("click", function () {
					$(itemsToInit).lightGallery({
						thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
						selector:  "[data-lightgallery='item']",
						autoplay:  $(itemsToInit).attr("data-lg-autoplay") === "true",
						pause:     parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
						addClass:  addClass,
						mode:      $(itemsToInit).attr("data-lg-animation") || "lg-slide",
						loop:      $(itemsToInit).attr("data-lg-loop") !== "false",
						dynamic:   true,
						dynamicEl: JSON.parse($(itemsToInit).attr("data-lg-dynamic-elements")) || []
					});
				});
			}
		}

		/**
		 * @desc Initialize the gallery with one image
		 * @param {object} itemToInit - jQuery object
		 * @param {string} [addClass] - additional gallery class
		 */
		function initLightGalleryItem(itemToInit, addClass) {
			if (!isNoviBuilder) {
				$(itemToInit).lightGallery({
					selector:            "this",
					addClass:            addClass,
					counter:             false,
					youtubePlayerParams: {
						modestbranding: 1,
						showinfo:       0,
						rel:            0,
						controls:       0
					},
					vimeoPlayerParams:   {
						byline:   0,
						portrait: 0
					}
				});
			}
		}

		// Google ReCaptcha
		if (plugins.captcha.length) {
			$.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
		}

		// Additional class on html if mac os.
		if (navigator.platform.match(/(Mac)/i)) {
			$html.addClass("mac-os");
		}

		// Adds some loosing functionality to IE browsers (IE Polyfills)
		if (isIE) {
			if (isIE === 12) $html.addClass("ie-edge");
			if (isIE === 11) $html.addClass("ie-11");
			if (isIE < 10) $html.addClass("lt-ie-10");
			if (isIE < 11) $html.addClass("ie-10");
		}

		// Bootstrap Tabs
		if (plugins.bootstrapTabs.length) {
			for (let i = 0; i < plugins.bootstrapTabs.length; i++) {
				let bootstrapTab = $(plugins.bootstrapTabs[i]);

				//If have slick carousel inside tab - resize slick carousel on click
				if (bootstrapTab.find('.slick-slider').length) {
					bootstrapTab.find('.tabs-custom-list > li > a').on('click', $.proxy(function () {
						let $this = $(this);
						let setTimeOutTime = isNoviBuilder ? 1500 : 300;

						setTimeout(function () {
							$this.find('.tab-content .tab-pane.active .slick-slider').slick('setPosition');
						}, setTimeOutTime);
					}, bootstrapTab));
				}

				let tabs = plugins.bootstrapTabs[i].querySelectorAll('.nav li a');

				for (var t = 0; t < tabs.length; t++) {
					var tab = tabs[t],
							target = document.querySelector( tabs[t].getAttribute( 'href' ) );

					tab.classList.remove( 'active','show' );
					target.classList.remove( 'active','show' );

					if ( t === 0 ) {
						tab.classList.add( 'active','show' );
						target.classList.add( 'active','show' );
					}
				}
			}
		}

		// Copyright Year (Evaluates correct copyright year)
		if (plugins.copyrightYear.length) {
			plugins.copyrightYear.text(initialDate.getFullYear());
		}

		// Add custom styling options for input[type="radio"]
		if (plugins.radio.length) {
			for (let i = 0; i < plugins.radio.length; i++) {
				$(plugins.radio[i]).addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
			}
		}

		// Add custom styling options for input[type="checkbox"]
		if (plugins.checkbox.length) {
			for (let i = 0; i < plugins.checkbox.length; i++) {
				$(plugins.checkbox[i]).addClass("checkbox-custom").after("<span class='checkbox-custom-dummy'></span>")
			}
		}

		// UI To Top
		if (isDesktop && !isNoviBuilder) {
			$().UItoTop({
				easingType:     'easeOutQuad',
				containerClass: 'ui-to-top fa fa-angle-up'
			});
		}

		// RD Navbar
		if (plugins.rdNavbar.length) {
			let
					navbar = plugins.rdNavbar,
					aliases = {
						'-':     0,
						'-sm-':  576,
						'-md-':  768,
						'-lg-':  992,
						'-xl-':  1200,
						'-xxl-': 1600
					},
					responsive = {},
					navItems = $('.rd-nav-item');

			for ( let i = 0; i < navItems.length; i++ ) {
				let node = navItems[i];

				if( node.classList.contains('opened') ) {
					node.classList.remove('opened')
				}
			}

			for (let alias in aliases) {
				let link = responsive[aliases[alias]] = {};
				if (navbar.attr('data' + alias + 'layout')) link.layout = navbar.attr('data' + alias + 'layout');
				if (navbar.attr('data' + alias + 'device-layout')) link.deviceLayout = navbar.attr('data' + alias + 'device-layout');
				if (navbar.attr('data' + alias + 'hover-on')) link.focusOnHover = navbar.attr('data' + alias + 'hover-on') === 'true';
				if (navbar.attr('data' + alias + 'auto-height')) link.autoHeight = navbar.attr('data' + alias + 'auto-height') === 'true';
				if (navbar.attr('data' + alias + 'stick-up-offset')) link.stickUpOffset = navbar.attr('data' + alias + 'stick-up-offset');
				if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
				if (isNoviBuilder) link.stickUp = false;
				else if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
			}

			plugins.rdNavbar.RDNavbar({
				anchorNav:    !isNoviBuilder,
				stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
				responsive:   responsive,
				callbacks:    {
					onStuck:        function () {
						let navbarSearch = this.$element.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
						}
					},
					onDropdownOver: function () {
						return !isNoviBuilder;
					},
					onUnstuck:      function () {
						if (this.$clone === null)
							return;

						let navbarSearch = this.$clone.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
							navbarSearch.trigger('blur');
						}

					}
				}
			});
		}

		// RD Search
		if (plugins.search.length || plugins.searchResults) {
			let handler = "bat/rd-search.php";
			let defaultTemplate = '<h5 class="search-title"><a target="_top" href="#{href}" class="search-link">#{title}</a></h5>' +
					'<p>...#{token}...</p>' +
					'<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>';
			let defaultFilter = '*.html';

			if (plugins.search.length) {
				for (let i = 0; i < plugins.search.length; i++) {
					let searchItem = $(plugins.search[i]),
							options = {
								element:   searchItem,
								filter:    (searchItem.attr('data-search-filter')) ? searchItem.attr('data-search-filter') : defaultFilter,
								template:  (searchItem.attr('data-search-template')) ? searchItem.attr('data-search-template') : defaultTemplate,
								live:      (searchItem.attr('data-search-live')) ? searchItem.attr('data-search-live') : false,
								liveCount: (searchItem.attr('data-search-live-count')) ? parseInt(searchItem.attr('data-search-live'), 10) : 4,
								current:   0,
								processed: 0,
								timer:     {}
							};

					let $toggle = $('.rd-navbar-search-toggle');
					if ($toggle.length) {
						$toggle.on('click', (function (searchItem) {
							return function () {
								if (!($(this).hasClass('active'))) {
									searchItem.find('input').val('').trigger('propertychange');
								}
							}
						})(searchItem));
					}

					if (options.live) {
						let clearHandler = false;

						searchItem.find('input').on("input propertychange", $.proxy(function () {
							this.term = this.element.find('input').val().trim();
							this.spin = this.element.find('.input-group-addon');

							clearTimeout(this.timer);

							if (this.term.length > 2) {
								this.timer = setTimeout(liveSearch(this, handler), 200);

								if (clearHandler === false) {
									clearHandler = true;

									$body.on("click", function (e) {
										if ($(e.toElement).parents('.rd-search').length === 0) {
											$('#rd-search-results-live').addClass('cleared').html('');
										}
									})
								}

							} else if (this.term.length === 0) {
								$('#' + this.live).addClass('cleared').html('');
							}
						}, options, this));
					}

					searchItem.submit($.proxy(function () {
						$('<input />').attr('type', 'hidden')
						.attr('name', "filter")
						.attr('value', this.filter)
						.appendTo(this.element);
						return true;
					}, options, this))
				}
			}

			if (plugins.searchResults.length) {
				let regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g;
				let match = regExp.exec(location.search);

				if (match !== null) {
					$.get(handler, {
						s:        decodeURI(match[1]),
						dataType: "html",
						filter:   match[2],
						template: defaultTemplate,
						live:     ''
					}, function (data) {
						plugins.searchResults.html(data);
					})
				}
			}
		}

		// Swiper
		if (plugins.swiper.length) {

			for (let i = 0; i < plugins.swiper.length; i++) {

				let
						node = plugins.swiper[i],
						params = parseJSON(node.getAttribute('data-swiper')),
						defaults = {
							speed:      1000,
							loop:       true,
							pagination: {
								el:        '.swiper-pagination',
								clickable: true
							},
							navigation: {
								nextEl: '.swiper-button-next',
								prevEl: '.swiper-button-prev'
							},
							scrollbar: {
								el: '.swiper-scrollbar',
								draggable: true,
								hide: false,
							},
							autoplay:   {
								delay: 5000
							}
						},
						xMode = {
							autoplay:      false,
							loop:          false,
							simulateTouch: false
						};

				params.on = {
					init: function () {
						setBackgrounds(this);
						setRealPrevious(this);
						initCaptionAnimate(this);

						// Initialize lightgallery items in cloned owl items
						initLightGalleryItem($(node).find('[data-lightgallery="item"]'), 'lightGallery-in-swiper');

						// Real Previous Index must be set recent
						this.on('slideChangeTransitionEnd', function () {
							setRealPrevious(this);
						});
					}
				};

				new Swiper( node, Util.merge( isNoviBuilder ? [ defaults, params, xMode ] : [ defaults, params ] ) );
			}
		}

		// Owl carousel
		if (plugins.owl.length) {
			for (let i = 0; i < plugins.owl.length; i++) {
				let
						node = plugins.owl[i],
						params = parseJSON( node.getAttribute( 'data-owl' ) ),
						defaults = {
							items: 1,
							margin: 30,
							loop: true,
							mouseDrag: true,
							stagePadding: 0,
							nav: false,
							navText: [],
							dots: false,
							autoplay: true,
							autoplayTimeout: 5000,
							smartSpeed: 1000,
							autoplayHoverPause: true
						},
						xMode = {
							autoplay: false,
							loop: false,
							mouseDrag: false
						},
						generated = {
							autoplay: node.getAttribute('data-autoplay') === 'true',
							loop: node.getAttribute( 'data-loop' ) !== 'false',
							mouseDrag: node.getAttribute( 'data-mouse-drag' ) !== 'false',
							responsive: {}
						},
						aliases = [ '-', '-sm-', '-md-', '-lg-', '-xl-', '-xxl-' ],
						values =  [ 0, 576, 768, 992, 1200, 1600 ],
						responsive = generated.responsive;

				for ( let j = 0; j < values.length; j++ ) {
					responsive[ values[ j ] ] = {};

					for ( let k = j; k >= -1; k-- ) {
						if ( !responsive[ values[ j ] ][ 'items' ] && node.getAttribute( 'data' + aliases[ k ] + 'items' ) ) {
							responsive[ values[ j ] ][ 'items' ] = k < 0 ? 1 : parseInt( node.getAttribute( 'data' + aliases[ k ] + 'items' ), 10 );
						}
						if ( !responsive[ values[ j ] ][ 'stagePadding' ] && responsive[ values[ j ] ][ 'stagePadding' ] !== 0 && node.getAttribute( 'data' + aliases[ k ] + 'stage-padding' ) ) {
							responsive[ values[ j ] ][ 'stagePadding' ] = k < 0 ? 0 : parseInt( node.getAttribute( 'data' + aliases[ k ] + 'stage-padding' ), 10 );
						}
						if ( !responsive[ values[ j ] ][ 'margin' ] && responsive[ values[ j ] ][ 'margin' ] !== 0 && node.getAttribute( 'data' + aliases[ k ] + 'margin' ) ) {
							responsive[ values[ j ] ][ 'margin' ] = k < 0 ? 30 : parseInt( node.getAttribute( 'data' + aliases[ k ] + 'margin' ), 10 );
						}
					}
				}

				// Initialize lightgallery items in cloned owl items
				$(node).on('initialized.owl.carousel', function () {
					initLightGalleryItem($(node).find('[data-lightgallery="item"]'), 'lightGallery-in-carousel');
				});

				node.owl = $( node );
				$( node ).owlCarousel( Util.merge( isNoviBuilder ? [ defaults, params, generated, xMode ] : [ defaults, params, generated ] ) );
			}
		}

		// WOW
		if ($html.hasClass("wow-animation") && plugins.wow.length && !isNoviBuilder && isDesktop) {
			new WOW().init();
		}

		// RD Input Label
		if (plugins.rdInputLabel.length) {
			plugins.rdInputLabel.RDInputLabel();
		}

		// Regula
		if (plugins.regula.length) {
			attachFormValidator(plugins.regula);
		}

		// RD Mailform
		if (plugins.rdMailForm.length) {
			let i, j, k,
					msg = {
						'MF000': 'Successfully sent!',
						'MF001': 'Recipients are not set!',
						'MF002': 'Form will not work locally!',
						'MF003': 'Please, define email field in your form!',
						'MF004': 'Please, define type of your form!',
						'MF254': 'Something went wrong with PHPMailer!',
						'MF255': 'Aw, snap! Something went wrong.'
					};

			for (i = 0; i < plugins.rdMailForm.length; i++) {
				let $form = $(plugins.rdMailForm[i]),
						formHasCaptcha = false;

				$form.attr('novalidate', 'novalidate').ajaxForm({
					data:         {
						"form-type": $form.attr("data-form-type") || "contact",
						"counter":   i
					},
					beforeSubmit: function (arr, $form, options) {
						if (isNoviBuilder)
							return;

						let form = $(plugins.rdMailForm[this.extraData.counter]),
								inputs = form.find("[data-constraints]"),
								output = $("#" + form.attr("data-form-output")),
								captcha = form.find('.recaptcha'),
								captchaFlag = true;

						output.removeClass("active error success");

						if (isValidated(inputs, captcha)) {

							// veify reCaptcha
							if (captcha.length) {
								let captchaToken = captcha.find('.g-recaptcha-response').val(),
										captchaMsg = {
											'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
											'CPT002': 'Something wrong with google reCaptcha'
										};

								formHasCaptcha = true;

								$.ajax({
									method: "POST",
									url:    "bat/reCaptcha.php",
									data:   {'g-recaptcha-response': captchaToken},
									async:  false
								})
								.done(function (responceCode) {
									if (responceCode !== 'CPT000') {
										if (output.hasClass("snackbars")) {
											output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

											setTimeout(function () {
												output.removeClass("active");
											}, 3500);

											captchaFlag = false;
										} else {
											output.html(captchaMsg[responceCode]);
										}

										output.addClass("active");
									}
								});
							}

							if (!captchaFlag) {
								return false;
							}

							form.addClass('form-in-process');

							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
								output.addClass("active");
							}
						} else {
							return false;
						}
					},
					error:        function (result) {
						if (isNoviBuilder)
							return;

						let output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
								form = $(plugins.rdMailForm[this.extraData.counter]);

						output.text(msg[result]);
						form.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
							window.dispatchEvent( new Event( 'resize' ) );
						}
					},
					success:      function (result) {
						if (isNoviBuilder)
							return;

						let form = $(plugins.rdMailForm[this.extraData.counter]),
								output = $("#" + form.attr("data-form-output")),
								select = form.find('select');

						form
						.addClass('success')
						.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
							window.dispatchEvent( new Event( 'resize' ) );
						}

						result = result.length === 5 ? result : 'MF255';
						output.text(msg[result]);

						if (result === "MF000") {
							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active success");
							}
						} else {
							if (output.hasClass("snackbars")) {
								output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active error");
							}
						}

						form.clearForm();

						if (select.length) {
							select.select2("val", "");
						}

						form.find('input, textarea').trigger('blur');

						setTimeout(function () {
							output.removeClass("active error success");
							form.removeClass('success');
						}, 3500);
					}
				});
			}
		}

		// lightGallery
		if (plugins.lightGallery.length) {
			for (let i = 0; i < plugins.lightGallery.length; i++) {
				initLightGallery(plugins.lightGallery[i]);
			}
		}

		// lightGallery item
		if (plugins.lightGalleryItem.length) {
			// Filter carousel items
			let notCarouselItems = [];

			for (let z = 0; z < plugins.lightGalleryItem.length; z++) {
				if (!$(plugins.lightGalleryItem[z]).parents('.owl-carousel').length &&
						!$(plugins.lightGalleryItem[z]).parents('.swiper-slider').length &&
						!$(plugins.lightGalleryItem[z]).parents('.slick-slider').length) {
					notCarouselItems.push(plugins.lightGalleryItem[z]);
				}
			}

			plugins.lightGalleryItem = notCarouselItems;

			for (let i = 0; i < plugins.lightGalleryItem.length; i++) {
				initLightGalleryItem(plugins.lightGalleryItem[i]);
			}
		}

		// Dynamic lightGallery
		if (plugins.lightDynamicGalleryItem.length) {
			for (let i = 0; i < plugins.lightDynamicGalleryItem.length; i++) {
				initDynamicLightGallery(plugins.lightDynamicGalleryItem[i]);
			}
		}

		// Bootstrap Date time picker
		if ( plugins.bootstrapDateTimePicker.length ) {
			for ( var i = 0; i < plugins.bootstrapDateTimePicker.length; i++ ) {
				var
					$dateTimePicker = $( plugins.bootstrapDateTimePicker[ i ] ),
					options = {
						date:      $dateTimePicker.attr( "data-time-picker" ) === "date",
						time:      $dateTimePicker.attr( "data-time-picker" ) === "time",
						shortTime: true
					};

				if ( options.date ) {
					options.format = 'DD/MM/YYYY';
					options.minDate = new Date();
				} else if ( options.time ) {
					options.format = 'HH:mm';
				} else {
					options.format = 'dddd DD MMMM YYYY - HH:mm';
				}

				$dateTimePicker.bootstrapMaterialDatePicker( options );
			}
		}
	});
}());
