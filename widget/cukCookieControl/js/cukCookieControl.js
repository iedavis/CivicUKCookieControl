/**
 * @fileoverview Civic UK Cookie Control Widget.
 * Option.
 * @author ian.davis@oracle.com
 **/

/**
  Cookie Control docs are here:  http://www.civicuk.com/cookie-law/downloads/README.html

  NOTE:  During testing, you can issue   CookieControl.reset()   from the Browser JavaScript Console.
         It will clear all previous user responses and clear the Cookie Control cookie.

  For Testing, you are welcome to use this API Key:   dcb1e3013c45aa5d7af6cd1d86fd7cf56258b4c6
  and set the Product Type to 'free'.

  If you get an API Key for a 'Paid' version, I've found that the Oracle VPN can cause issues because
  I *think* Cookie Control geoip database is a little out of date, so although I am in UK, it thought
  I was in Greece, which made Cookie Control not function.
**/


define(
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
//  ['knockout', 'pubsub', 'CCi18n', 'ccConstants', '/file/widget/cukCookieControl/js/cookieControl-6.2.min.js'],
  ['knockout', 'pubsub', 'CCi18n', 'ccConstants', 'js/cookieControl-6.2.min'],
    
  //-------------------------------------------------------------------
  // MODULE DEFINITION
  //-------------------------------------------------------------------
  function(ko, pubsub, CCi18n, CCConstants, cukCookie) {

    "use strict";

    var LOCALSTORAGE_COOKIE_KEY = "cc.cookies.cookies-accepted";

    return {

      onLoad: function(widget) {

        if(widget.apiKey() !== null ) {

          var cukConfig = {};

          cukConfig.apiKey = widget.apiKey();

          switch (widget.product()) {
            case 'paid':
              cukConfig.product = CookieControl.PROD_PAID;
              break;
            case 'multisite':
              cukConfig.product = CookieControl.PROD_PAID_MULTISITE;
              break;
            case 'custom':
              cukConfig.product = CookieControl.PROD_PAID_CUSTOM;
              break;
            case 'free':
              cukConfig.product = CookieControl.PROD_FREE;
              break;
            default:
              cukConfig.product = CookieControl.PROD_FREE;
          }

          switch (widget.model()) {
            case 'info':
              cukConfig.consentModel = CookieControl.MODEL_INFO;
              break;
            case 'explicit':
              cukConfig.consentModel = CookieControl.MODEL_EXPLICIT;
              break;
            case 'implicit':
              cukConfig.consentModel = CookieControl.MODEL_IMPLICIT;
              break;
            default:
              cukConfig.consentModel = CookieControl.MODEL_INFO;
          }

          switch (widget.style()) {
            case 'square':
              cukConfig.style = CookieControl.STYLE_SQUARE;
              break;
            case 'diamond':
              cukConfig.style = CookieControl.STYLE_DIAMOND;
              break;
            case 'bar':
              cukConfig.style = CookieControl.STYLE_BAR;
              break;
            case 'triangle':
              cukConfig.style = CookieControl.STYLE_TRIANGLE;
              break;
            default:
              cukConfig.style = CookieControl.STYLE_TRIANGLE;
          }

          switch (widget.position()) {
            case 'left':
              cukConfig.position = CookieControl.POS_LEFT;
              break;
            case 'right':
              cukConfig.position = CookieControl.POS_RIGHT;
              break;
            case 'top':
              cukConfig.position = CookieControl.POS_TOP;
              break;
            case 'bottom':
              cukConfig.position = CookieControl.POS_BOTTOM;
              break;
            default:
              cukConfig.position = CookieControl.POS_LEFT;
          }

          if(widget.style() === 'bar'){
            if(widget.position() !== 'top' && widget.position() !== 'bottom') {
              cukConfig.position = CookieControl.POS_BOTTOM;
            }
          } else {
            if(widget.position() !== 'left' && widget.position() !== 'right') {
              cukConfig.position = CookieControl.POS_LEFT;
            }
          }

          if(widget.theme() === 'light'){
            cukConfig.theme = CookieControl.THEME_LIGHT;
          } else {
            cukConfig.theme = CookieControl.THEME_DARK;
          }

          if(widget.startOpen() === 'yes'){
            cukConfig.startOpen = true;
          } else {
            cukConfig.startOpen = false;
          }

          cukConfig.policyVersion = widget.policyVersion();
          cukConfig.countries = widget.countries();

          cukConfig.autoHide = 7000;
          cukConfig.onlyHideIfConsented = true;
          cukConfig.subdomains = true;

          cukConfig.t = {};
          cukConfig.t.title = '<p>' + CCi18n.t('ns.cukCookieControl:resources.cccTitle') + '</p>';
          cukConfig.t.intro = '<p>' + CCi18n.t('ns.cukCookieControl:resources.cccIntro') + '</p>';
          cukConfig.t.full = '<p><a href="/#!/privacy">' + CCi18n.t('ns.cukCookieControl:resources.cccFull') + '</a></p>';

          cukConfig.onAccept =  function() {widget.onCookiesAccept();};

//        Main call to invoke Cookie Control, passing the configuration object we've set up.
//        cookieControl object is established by the cookieControl-6.2.min.js file loaded in dependencies.
//        Also subscribe to PAGE_CHANGED so we can manage cookies if user has disallowed their use.

          if(cookieControl) {
            cookieControl( cukConfig );
            $.Topic(pubsub.topicNames.PAGE_CHANGED).subscribe(this.pageChanged);
          }
        }
      },

      onCookiesAccept: function() {

//      NOTE that booleans in localStorage are inconsistently handled by different browsers, so forcing storage as String.
        localStorage.setItem(LOCALSTORAGE_COOKIE_KEY, 'true');
      },

      pageChanged: function(page){

//      NOTE that booleans in localStorage are inconsistently handled by different browsers, so forcing storage as String.
        localStorage.setItem(LOCALSTORAGE_COOKIE_KEY, CookieControl.maySendCookies().toString());

//      Might be over-the-top, but if Cookies have not been allowed by user, we should make sure other code has not
//      been naughty and dropped one.  If user has disallowed cookies, we will delete all cookies, except our needed
//      ones, on every page refresh, just to make sure.

        if(CookieControl.maySendCookies() === false){
          //  Deletes all cookies except for those named in the passed array.
          CookieControl.delAllCookies(CCConstants.PROTECTED_COOKIES);
        }
      }
    };
  }
);
