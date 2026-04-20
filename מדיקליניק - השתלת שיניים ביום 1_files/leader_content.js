// JavaScript Document
//function getReferrerDomain name() {
// if you want all the url path simply use last_referrer ==document.referrer; instead of all this lines
//function getReferrerDomain() {

var refurl = document.createElement("a");
refurl.href = document.referrer;
//return url.hostname;
var refhostname = refurl.hostname;

  // if the document refferer is not our domain insert value in last_refferer
  if (refhostname != window.location.hostname) {
    var hostname_nowwww = refhostname.replace(/^www./, "");
    var last_referrer = hostname_nowwww;
    //console.log ('the last refferer is'+last_referrer);
  } else {
    //console.log ('the document.referrer is our domain so last_refferer will be empty');
    var last_referrer = "";
    //console.log ('the last refferer is empty'+last_referrer);
  }

  //}

  //}

  var user_set_tid = "G-BTCVPL87XW"; //PLEASE PUT GA MEASUREMENT ID HERE FOR NON-STANDARD IMPLEMENTATIONS eg. G-XXXXXXXX

  //////////////// cookie functions //////////////////////////////////////////////////////////////////////
  function createCookie(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie =
      name + "=" + encodeURIComponent(value) + expires + "; path=/";
  }

  function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function eraseCookie(name) {
    createCookie(name, "", -1);
  }

  /////////////// cookie functions end ////////////////////////////////////////////////////////////////

  ////////////// start take utm variables from url and save to cookies
  // Parse the URL
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // Give the URL parameters variable names
  var c_utm_source = getParameterByName("utm_source");
  var c_utm_medium = getParameterByName("utm_medium");
   var c_exone = getParameterByName('exone');
  var c_utm_campaign = getParameterByName("utm_campaign");
  var c_AgId = getParameterByName("AgId");
  var c_utm_term = getParameterByName("utm_term");
  var c_AdPos = getParameterByName("AdPos");
  var c_utm_content = getParameterByName("utm_content");
  var c_device = getParameterByName("device");
  var c_GeoLoc = getParameterByName("GeoLoc");
  var c_content_site = getParameterByName("content_site");
  var c_lp = getParameterByName("lp");
  var c_gclid = getParameterByName("gclid");
  var c_fbclid = getParameterByName("fbclid");
  
  function getGa4MeasurementIdsFromGtag() {
    const measurementIds = [];
    if (typeof gtag !== "undefined") {
      const scripts = document.getElementsByTagName("script");
      Array.from(scripts).forEach((script) => {
        const match = script.src.match(/id=([^&]+)/);
        if (match) {
          const id = match[1];
          if (id.startsWith('G-') && !measurementIds.includes(id)) {
            measurementIds.push(id);
          }
        }
      });
    }
    return measurementIds;
  }

   function get_ga_clientid(retryCount = 0) {
      var cookie = {};
      document.cookie.split(";").forEach(function(el) {
        var splitCookie = el.split("=");
        var key = splitCookie[0].trim();
        var value = splitCookie[1];
        cookie[key] = value;
      });

  if (typeof cookie["_ga"] != "undefined") {
        document.cookie = "cc_ga4_cid=" + cookie["_ga"].substring(6);
      } else if (retryCount < 5) {
        setTimeout(function() {
          get_ga_clientid(retryCount + 1);
        }, 200);
      } else {
        console.log("Leader: Max retries reached for ga4_cid.");
        createCookie("cc_ga4_cid", "", 7);
      }
    }

 if (typeof user_set_tid !== 'undefined' && user_set_tid !== "") {
      c_ga4_tid = user_set_tid;
      createCookie("cc_ga4_tid", c_ga4_tid, 7); // Set cookie
      console.log("Leader: MeasurementID implemented via Leader Plugin.");
    }

   //All Google and FB analytics set to launch after a small delay
    setTimeout(function() {
      if (typeof ga != "undefined") {
        if (typeof ga.getAll != "undefined") {
          var c_cid = ga.getAll()[0].get("clientId");
        } // Set cookie}
      } else {
        var c_cid = "";
      }

      if (typeof gtag === "function") {
        if (typeof user_set_tid !== 'undefined' && user_set_tid !== "") {

        } else {
          var ga4_tid = getGa4MeasurementIdsFromGtag();
          c_ga4_tid = ga4_tid[ga4_tid.length - 1];
        }
        get_ga_clientid();
      } else {
        if (typeof user_set_tid !== 'undefined' && user_set_tid !== "") {

        } else {
          console.log("GTAG Not Found on Page. If you believe you have GTAG installed for GA4, it is likely not a standard implementation. In this case, please manually enter the measurement ID in the Advanced tab of the Leader plugin settings.");
          var c_ga4_tid = "";
        }

        function checkCookie(name) {
          var cookieArr = document.cookie.split(";");

          for (var i = 0; i < cookieArr.length; i++) {
            var cookiePair = cookieArr[i].split("=");

            if (name == cookiePair[0].trim()) {
              return true; // Cookie exists
            }
          }
          return false; // Cookie does not exist
        }

        if (checkCookie('_ga')) {
          get_ga_clientid();
        } else {
          var c_ga4_cid = "";
          createCookie("cc_ga4_cid", c_ga4_cid, 7);
        }
      }

      function checkFbqState(retries, delay) {
        if (typeof fbq.getState != 'undefined') {
          // fbq.getState is a function, so call it
          c_fbq_account = fbq.getState().pixels[0]["id"];
          createCookie("cc_fbq_account", c_fbq_account, 7);
        } else if (retries > 0) {
          // Retry after a delay
          setTimeout(function() {
            checkFbqState(retries - 1, delay);
          }, delay);
        } else {
          c_fbq_account = "";
          createCookie("cc_fbq_account", c_fbq_account, 7);
          // Handle the case where fbq.getState never becomes available
          console.log("Leader: fbq.getState is not available after multiple attempts");
        }
      }


      function get_fbq_client(retryCount = 0) {
        var cookie = {};
        document.cookie.split(";").forEach(function(el) {
          var splitCookie = el.split("=");
          var key = splitCookie[0].trim();
          var value = splitCookie[1];
          cookie[key] = value;
        });

        if (typeof cookie["_fbp"] != "undefined") {
          document.cookie = "cc_fbq_client=" + cookie["_fbp"];
        } else if (retryCount < 5) {
          setTimeout(function() {
            get_fbq_client(retryCount + 1);
          }, 150);
        } else {
          console.log("Leader: Max retries reached. _fbp cookie not found.");
          createCookie("cc_fbq_client", "", 7);
        }
      }



      if (typeof fbq != "undefined") {
        get_fbq_client();
        checkFbqState(5, 150);
      } else {
        var c_fbq_account = "";
        var c_fbq_client = "";
        createCookie("cc_fbq_account", c_fbq_account, 7);
        createCookie("cc_fbq_client", c_fbq_client, 7); // Set cookie
      }

      createCookie("cc_cid", c_cid, 5);
      //This code checks if the cookie already exists, and if it doesn't, it creates it (In case the user has not put in the Measurement ID in the advanced tab)
      if (document.cookie.indexOf('cc_ga4_tid') != -1) {} else {
        createCookie("cc_ga4_tid", c_ga4_tid, 7); // Set cookie
      }

    }, 1000);
  var c_fbq_time = Date.now();
  createCookie("cc_fbq_time", c_fbq_time, 7); // Set cookie
  ///END OF GOOGLE ANALYTICS AND FACEBOOK INFO

  /////////////////////////////// take variables from url and create cokies from varibles
  if (c_utm_source) {
    createCookie("cc_utm_source", c_utm_source, 7); // Set cookie
    createCookie("cc_utm_medium", c_utm_medium, 7); // Set cookie
    createCookie('cc_exone', c_exone, 5); // Set cookie
    createCookie("cc_utm_campaign", c_utm_campaign, 7); // Set cookie
    createCookie("cc_AgId", c_AgId, 7); // Set cookie
    createCookie("cc_utm_term", c_utm_term, 7); // Set cookie
    createCookie("cc_AdPos", c_AdPos, 7); // Set cookie
    createCookie("cc_utm_content", c_utm_content, 7); // Set cookie
    createCookie("cc_device", c_device, 7); // Set cookie
    createCookie("cc_GeoLoc", c_GeoLoc, 7); // Set cookie
    createCookie("cc_content_site", c_content_site, 7); // Set cookie
    createCookie("cc_lp", c_lp, 7); // Set cookie
    createCookie("cc_gclid", c_gclid, 7); // Set cookie
    createCookie("cc_fbclid", c_fbclid, 7); // Set cookie
  }
  

  // now get cookies variables and give theme variable names to use later
  gt_cc_utm_source = readCookie("cc_utm_source");
  gt_cc_utm_medium = readCookie("cc_utm_medium")? readCookie("cc_utm_medium"): "";
  gt_cc_utm_campaign = readCookie("cc_utm_campaign")? readCookie("cc_utm_campaign"): "";
  gt_cc_exone = readCookie('cc_exone') ? readCookie('cc_exone') : "";
  gt_cc_AgId = readCookie("cc_AgId") ? readCookie("cc_AgId") : "";
  gt_cc_utm_term = readCookie("cc_utm_term") ? readCookie("cc_utm_term") : "";
  gt_cc_AdPos = readCookie("cc_AdPos") ? readCookie("cc_AdPos") : "";
  gt_cc_utm_content = readCookie("cc_utm_content")? readCookie("cc_utm_content"): "";
  gt_cc_device = readCookie("cc_device") ? readCookie("cc_device") : "";
  gt_cc_GeoLoc = readCookie("cc_GeoLoc") ? readCookie("cc_GeoLoc") : "";
  gt_cc_content_site = readCookie("cc_content_site")? readCookie("cc_content_site"): "";
  gt_cc_lp = readCookie("cc_lp") ? readCookie("cc_lp") : "";
  gt_cc_gclid = readCookie("cc_gclid") ? readCookie("cc_gclid") : "";
  gt_cc_fbclid = readCookie("cc_fbclid") ? readCookie("cc_fbclid") : "";
  gt_cc_fbq_time = readCookie("cc_fbq_time") ? readCookie("cc_fbq_time") : "";
  setTimeout(function () {
    gt_cc_cid = readCookie("cc_cid") ? readCookie("cc_cid") : "";
    gt_cc_ga4_cid = readCookie("cc_ga4_cid") ? readCookie("cc_ga4_cid") : "";
    gt_cc_ga4_tid = readCookie("cc_ga4_tid") ? readCookie("cc_ga4_tid") : "";
    gt_cc_fbq_client = readCookie("cc_fbq_client") ? readCookie("cc_fbq_client") : "";
    gt_cc_fbq_account = readCookie("cc_fbq_account") ? readCookie("cc_fbq_account") : "";
  }, 1500);

  if (gt_cc_utm_source) {
    //console.log("have utm_source, not seeking for refferer");
    //console.log("utm_source:" + gt_cc_utm_source);

    if (last_referrer) {
      //console.log ("just to let you know that we have but dont use this refferer: " + last_referrer);
    }
  } else {
    //console.log('no utm now checking for last_referrer');
    if (last_referrer) {
      //console.log('utm_source from reff now');
      createCookie("cc_utm_source", last_referrer, 7); // Set cookie
      gt_cc_utm_source = readCookie("cc_utm_source");
    } else {
      gt_cc_utm_source = "direct";
      //console.log ("did not find any refferer so call it direct");
      //console.log("utm_source:" + gt_cc_utm_source);
    }
  }

  console.log("Leader utms:" + gt_cc_utm_source);

  ///////// phones part start /////////////////////////////////////////////////////////////////////////////////////

  ///////// choose the right phone to display /////
  ////////// start from here to switch phones
  //////////by the gt_cc_utm_source which tell us
  //////////the name of the utm_source correctly
  ///////// even if it is direct.

  //console.log ('the gt is:'+gt_cc_utm_source)
  // choose the number to display
  //var number_to_display = '09-9999997';

  if (gt_cc_utm_source == "google_ads") {
    var number_to_display = "077-8038468";
  } else {
    var number_to_display = "077-8035813";
  }

  // the base number we want to replace in the site
  var base_number_to_replace = "03-1111111";
  var footer_number_to_replace = "03-2222222";
  var link_number_to_replace = "03-3333333";

  //////////////////////////  phone replacement start

  /// replace the base number in the body test
function GReplacePhoneTxt(rnew) {
    jQuery("span, p, h1, h2, h3, h4").each(function () {
        // Get the HTML content
        var rep = jQuery(this).html();
        
        // Check if base_number_to_replace is present
        if (rep.includes(base_number_to_replace)) {
            // Replace the text
            rep = rep.replace(base_number_to_replace, rnew);
            jQuery(this).html(rep);
        }
    });
}


  //do it
  GReplacePhoneTxt(number_to_display);

  // from wp - replace the base numbers in links (href)
function GReplacePhoneLink(rnew) {
    var newnum = rnew;
    jQuery('a[href^="tel:' + base_number_to_replace + '"]').each(function () {
        // Replace the link href
        jQuery(this).attr("href", "tel:" + newnum);
        
        // Replace the link text only if base_number_to_replace is present
        var rep = jQuery(this).html();
        if (rep.includes(base_number_to_replace)) {
            rep = rep.replace(base_number_to_replace, rnew);
            jQuery(this).html(rep);
        }
    });
}

  //do it
  GReplacePhoneLink(number_to_display);

  /// replace the footer number
function GReplaceFooterPhoneTxt(rnew) {
    jQuery("p").each(function () {
        var rep = jQuery(this).html();
        // Check if the footer_number_to_replace is present
        if (rep.includes(footer_number_to_replace)) {
            // Replace the text
            rep = rep.replace(footer_number_to_replace, rnew);
            jQuery(this).html(rep);
        }
    });
}

  //do it
  GReplaceFooterPhoneTxt(number_to_display);

  //replace links
function GReplacePhoneLinkNew(rnew) {
    var newnum = rnew;
    jQuery('a[href^="tel:' + link_number_to_replace + '"]').each(function () {
        // Replace the link href
        jQuery(this).attr("href", "tel:" + newnum);
        
        // Replace the link text only if link_number_to_replace is present
        var rep = jQuery(this).html();
        if (rep.includes(link_number_to_replace)) {
            rep = rep.replace(link_number_to_replace, rnew);
            jQuery(this).html(rep);
        }
    });
}

  //do it
  GReplacePhoneLinkNew(number_to_display);

  //////////////////////////  phone replacement end

  //////////////////// phone pixel with cookie data

    var head = document.getElementsByTagName("head")[0];
    // Creating script element
    var script = document.createElement("script");
    script.id = "msq_pixel_id";
    script.async = false;
   script.src =
      "https://s3.eu-central-1.amazonaws.com/maskyoo-cdn/msq_pixel_2023.js";
    script.type = "text/javascript";
    head.append(script);

    setTimeout(function () {

         msq_r(function() {
        var pixel_settings = {
          setting_api_key: "4d5-f95803-0a6",
          setting_wait4async: false,
          setting_ignore_cookies: false,
        };
        var msq_pixel = new MSQ(pixel_settings);

        msq_pixel.push("__maskyoo", number_to_display);
        msq_pixel.push("__ga4_tid", gt_cc_ga4_tid); // You can put the google analytics measurement ID that you wish to in this space
        msq_pixel.push("utm_source", gt_cc_utm_source);
        //if (gt_cc_cid !== "") msq_pixel.push("cid", gt_cc_cid);
        //if (gt_cc_ga4_cid !== "") msq_pixel.push("ga4_cid", gt_cc_ga4_cid);
        if (gt_cc_utm_campaign !== "") msq_pixel.push("utm_campaign", gt_cc_utm_campaign);
        if (gt_cc_AgId !== "") msq_pixel.push("AgId", gt_cc_AgId);
        if (gt_cc_utm_term !== "") msq_pixel.push("utm_term", gt_cc_utm_term);
        if (gt_cc_AdPos !== "") msq_pixel.push("AdPos", gt_cc_AdPos);
        if (gt_cc_utm_content !== "") msq_pixel.push("utm_content", gt_cc_utm_content);
        if (gt_cc_device !== "") msq_pixel.push("device", gt_cc_device);
        if (gt_cc_GeoLoc !== "") msq_pixel.push("GeoLoc", gt_cc_GeoLoc);
        if (gt_cc_utm_medium !== "") msq_pixel.push("utm_medium", gt_cc_utm_medium);
        if (gt_cc_content_site !== "") msq_pixel.push("content_site", gt_cc_content_site);
        if (gt_cc_lp !== "") msq_pixel.push("lp", gt_cc_lp);
        if (gt_cc_gclid !== "") msq_pixel.push("gclid", gt_cc_gclid);
        if (gt_cc_fbclid !== "") msq_pixel.push("fbclid", gt_cc_fbclid);
        //18 if (gt_cc_fb_cid !== "") msq_pixel.push("fb_cid", gt_cc_fb_cid);
        //if (gt_cc_fb_acc !== "") msq_pixel.push("fb_acc", gt_cc_fb_acc);
        //if (gt_cc_fb_time !== "") msq_pixel.push("fb_time", gt_cc_fb_time);
        msq_pixel.push("theurl", decodeURIComponent(window.location.href)); //Send URL Leader way
        msq_pixel.pushUrlParam("URL_Parameter"); //Send URL parameter automatically to maskyoo, Replace URL_Param with actual URL Parameter
        msq_pixel.process();
      });


        /////////////////////////////////////////////phone pixel end

        ///////////////////////////// phones part end //////////////////////////////////////////////////////////////////////////

        ///////////////////////////// form part start //////////////////////////////////////////////////////////////////////////

        ////////////////////// take the utm data from cookies to add later with form data

        window.leader_data = {
          utm_source: gt_cc_utm_source,
          utm_campaign: gt_cc_utm_campaign,
          AgId: gt_cc_AgId,
          utm_term: gt_cc_utm_term,
          AdPos: gt_cc_AdPos,
          utm_content: gt_cc_utm_content,
          device: gt_cc_device,
          GeoLoc: gt_cc_GeoLoc,
          utm_medium: gt_cc_utm_medium,
          content_site: gt_cc_content_site,
          theurl: decodeURIComponent(window.location.href),
          lp: gt_cc_lp,
          gclid: gt_cc_gclid,
          fbclid: gt_cc_fbclid,
          ga4_tid: gt_cc_ga4_tid,
          ga4_cid: gt_cc_ga4_cid,
          exone: gt_cc_exone,
          cid: gt_cc_cid,
          page_title: document.title,
          fbq_account: gt_cc_fbq_account,
          fbq_client: gt_cc_fbq_client,
          fbq_time: gt_cc_fbq_time,
        };
      }, 1500);

        function msq_r(f) { /in/.test(document.readyState) ? setTimeout("msq_r(" + f + ")", 9) : f();
        }

     ///////////////////////////////////////////////////////
// Store the original console.log function in a variable
const originalConsoleLog = console.log;
console.log = (...args) => {
  const modifiedArgs = args.map(arg =>
    typeof arg === 'string' ? arg.replace(/MSQ/g, 'Leader') : arg
  );
  originalConsoleLog(...modifiedArgs);};
     ///////////////////////////////////////////////////////


    /// form type A - contact forms submition
    /// identify the form by class name
    $('[data-at="form-button"]').eq(3).on("click",function (event) {
      // console.log($('[data-at="form-text"]').eq(0).val());
      // console.log($('[data-at="form-select"]').eq(0).val());
      // console.log($('[data-at="form-text"]').eq(1).val());
      // console.log($('[data-at="form-text"]').eq(2).val().replace(/[^0-9.]/g, ''));
      //if ( $( "input:first" ).val() === "ggg" ) {
      if ($('[data-at="form-text"]').eq(2).val().replace(/[^0-9.]/g, '').length > 9) {
        // show validate succesfuly text and proceed to sending tasks
        //$( "span" ).text( "Validated..." ).show();
      
        //leader api
        var obj = $.extend({}, window.leader_data);
        obj.Fname = $('[data-at="form-text"]').eq(0).val();
        //obj.Phone = $("#form_pre_phone").val() + $("#phone").val(); // in case you seperate prefix and phone in your form
        obj.age = $('[data-at="form-select"]').eq(0).val();
        obj.city = $('[data-at="form-text"]').eq(1).val();
        obj.Phone = $('[data-at="form-text"]').eq(2).val().replace(/[^0-9.]/g, '');
        //obj.agree = $("#subscribe_cb").is(":checked") ? "yyy" : "nnn";
        $.ajax({
          url: "https://sites.leader.online/pixel/lp.lasertips.co.il/send_to_leader.php",
          type: "POST",
          // the next 3 lines not needed if your form does not move to different url on submit
          async: false,
          cache: false,
          timeout: 3000,
        
          data: obj,
        
          success: function () {
            //console.log('success ajax');
          },
        
          error: function () {
            //console.log("this is the ajax error details:" + JSON.stringify(data));
          },
        });
        // ajax end
      
        return;
      } // end of no error else statement
    }); // submit function event close

        $('[data-at="form-button"]').eq(7).on("click",function (event) {
      // console.log($('[data-at="form-text"]').eq(3).val());
      // console.log($('[data-at="form-select"]').eq(1).val());
      // console.log($('[data-at="form-text"]').eq(4).val());
      // console.log($('[data-at="form-text"]').eq(5).val().replace(/[^0-9.]/g, ''));

      //if ( $( "input:first" ).val() === "ggg" ) {
      if ($('[data-at="form-text"]').eq(5).val().replace(/[^0-9.]/g, '').length > 9) {
        // show validate succesfuly text and proceed to sending tasks
        //$( "span" ).text( "Validated..." ).show();
      
        //leader api
        var obj = $.extend({}, window.leader_data);
        obj.Fname = $('[data-at="form-text"]').eq(3).val();
        //obj.Phone = $("#form_pre_phone").val() + $("#phone").val(); // in case you seperate prefix and phone in your form
        obj.age = $('[data-at="form-select"]').eq(1).val();
        obj.city = $('[data-at="form-text"]').eq(4).val();
        obj.Phone = $('[data-at="form-text"]').eq(5).val().replace(/[^0-9.]/g, '');
        //obj.agree = $("#subscribe_cb").is(":checked") ? "yyy" : "nnn";
        $.ajax({
          url: "https://sites.leader.online/pixel/lp.lasertips.co.il/send_to_leader.php",
          type: "POST",
          // the next 3 lines not needed if your form does not move to different url on submit
          async: false,
          cache: false,
          timeout: 3000,
        
          data: obj,
        
          success: function () {
            //console.log('success ajax');
          },
        
          error: function () {
            //console.log("this is the ajax error details:" + JSON.stringify(data));
          },
        });
        // ajax end
      
        return;
      } // end of no error else statement
    }); // submit function event close

         $('[data-at="form-button"]').eq(11).on("click",function (event) {
      // console.log($('[data-at="form-text"]').eq(6).val());
      // console.log($('[data-at="form-select"]').eq(2).val());
      // console.log($('[data-at="form-text"]').eq(7).val());
      // console.log($('[data-at="form-text"]').eq(8).val().replace(/[^0-9.]/g, ''));
       if ($('[data-at="form-text"]').eq(8).val().replace(/[^0-9.]/g, '').length > 9) {
        // show validate succesfuly text and proceed to sending tasks
        //$( "span" ).text( "Validated..." ).show();
      
        //leader api
        var obj = $.extend({}, window.leader_data);
        obj.Fname = $('[data-at="form-text"]').eq(6).val();
        //obj.Phone = $("#form_pre_phone").val() + $("#phone").val(); // in case you seperate prefix and phone in your form
        obj.age = $('[data-at="form-select"]').eq(3).val();
        obj.city = $('[data-at="form-text"]').eq(7).val();
        obj.Phone = $('[data-at="form-text"]').eq(8).val().replace(/[^0-9.]/g, '');
        //obj.agree = $("#subscribe_cb").is(":checked") ? "yyy" : "nnn";
        $.ajax({
          url: "https://sites.leader.online/pixel/lp.lasertips.co.il/send_to_leader.php",
          type: "POST",
          // the next 3 lines not needed if your form does not move to different url on submit
          async: false,
          cache: false,
          timeout: 3000,
        
          data: obj,
        
          success: function () {
            //console.log('success ajax');
          },
        
          error: function () {
            //console.log("this is the ajax error details:" + JSON.stringify(data));
          },
        });
        // ajax end
      
        return;
      } // end of no error else statement
    }); // submit function event close
    

//////////////////////////////////////////////////////////////////form submition end
///////////////////////////// forms part end //////////////////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////
   // STOP HERE                               ////
  // BETA FEATURE - ONLY FOR ADVANCED USERS  ////
 ///////////////////////////////////////////////

//// Here begins the start of the callback popup

  var link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = "https://sites.leader.online/pixel/lp.lasertips.co.il/callback/callback.css"; //Change link to where the callback.css is located on your site
  al.appendChild(link);

  // var linkbootstrap = document.createElement("link");
  // linkbootstrap.type = "text/css";
  // linkbootstrap.rel = "stylesheet";
  // linkbootstrap.href = "//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css";
  // al.appendChild(linkbootstrap);

  var callback_popup = document.createElement("div");
  callback_popup.id = "popupstorage";
  callback_popup.async = "";
  callback_popup.defer = "";
  bl.appendChild(callback_popup);

  //This script enters the callback popup into the page.

  //*Note that you can change the title and description inside the form

  //***IMPORTANT: Must change the link in the script at the bottom to be where your callback_function is */
  var data = `
    <div class='lcbn-pop-wrap' dir="rtl">
        <div class='lcbn-pop-content'>
            <a class="boxclose" id="boxclose" tabindex="4" aria-label="התחברו לנציג"></a>
            <h1>שיחה עם נציג</h1> <!--Title can be changed  -->

            <form action="process.php" method="POST" id="leader-callback-form">
                <div id="Phone-group" class="form-group">
                    <label id="callbackdescr" for="Phone">מלאו את מספר הטלפון והמערכת תחבר אתכם מיידית עם נציג</label> <!-- Description can be changed as well  -->
                    <input type="tel" tabindex="2" maxlength="10" class="form-control" aria-label="התחבר לנציג על ידי הזנת מספר הטלפון שלך" name="lcbnPhone" placeholder="* טלפון" onkeyup="this.value=this.value.replace(/[^0-9]/g,'');">
                    <input type="hidden" name="cbfnum">
                </div>
                <button type="submit" tabindex="3" id="submitbtn">חבר אותי לנציג</button>
                <div id="loading"></div>
            </form>
        </div>
    </div>
            <a class='lcbn-pop button glyphicon glyphicon-earphone jk-phone desktop-phone-btn' tabindex="0" id="phonebt" role="button" href='#' aria-label="התחברו לנציג"></a>
            <a class='lcbn-pop button glyphicon glyphicon-earphone jk-phone mobile-phone-btn' tabindex="6" role="button" aria-label="התחברו לנציג" ); ?></a>

<script src="https://sites.leader.online/pixel/lp.lasertips.co.il/callback/callback_function.js"></script>  <!-- Your URL goes here  -->
`;
  $(callback_popup).html(data);

/////////////////////////// callback part end //////////////////////////////////////////////////////////////////////////





///////////////////////////////// Whatsapp part start ///////////////////////////////////////////////////////

//   var whatsapp_popup = document.createElement("div");
//   whatsapp_popup.id = "whatsappstorage";
//   whatsapp_popup.async = "";
//   whatsapp_popup.defer = "";
//   bl.appendChild(whatsapp_popup);

//   var link = document.createElement("link");
//   link.type = "text/css";
//   link.rel = "stylesheet";
//   link.href = "https://sites.leader.online/pixel/xxx.co.il/whatsapp/whatsapp.css"; //Change link
//   al.appendChild(link);

//   var data = `

// <script>
// function set_leader_inputs(gt_cc_utm_source) {
//   // create the url for contact form and elementor
//   theurl = decodeURIComponent(window.location.href);
//   page_title = document.title;
//   jQuery('input[name="theurl"]').val(theurl);
//   jQuery('input[name="page_title"]').val(page_title);

//   // set the form hidden values
//   if (gt_cc_utm_source) {
//     console.log(gt_cc_utm_source);
//     jQuery('input[name="utm_source"]').val(gt_cc_utm_source);
//     jQuery('input[name="content_site"]').val(gt_cc_content_site);
//     jQuery('input[name="utm_medium"]').val(gt_cc_utm_medium);
//     jQuery('input[name="gclid"]').val(gt_cc_gclid);
//     jQuery('input[name="fbclid"]').val(gt_cc_fbclid);
//     jQuery('input[name="utm_campaign"]').val(gt_cc_utm_campaign);
//     jQuery('input[name="AgId"]').val(gt_cc_AgId);
//     jQuery('input[name="utm_term"]').val(gt_cc_utm_term);
//     jQuery('input[name="AdPos"]').val(gt_cc_AdPos);
//     jQuery('input[name="utm_content"]').val(gt_cc_utm_content);
//     jQuery('input[name="device"]').val(gt_cc_device);
//     jQuery('input[name="GeoLoc"]').val(gt_cc_GeoLoc);
//     jQuery('input[name="lp"]').val(gt_cc_lp);
//   }
// }
// </script>

//    <button id="leader-whatsapp-start-btn">

//     <span>

//         <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="27.86" height="27.65" viewBox="0 0 21.86 21.65">

//             <path class="cls-1" d="M306.16,406.75h0a12.81,12.81,0,0,1-5.2-1.33l-5.77,1.52,1.55-5.64a10.82,10.82,0,0,1-1.46-5.44,11.13,11.13,0,0,1,18.58-7.7,11.12,11.12,0,0,1,3.19,7.7A10.91,10.91,0,0,1,306.16,406.75Zm6.39-17.29a9,9,0,0,0-6.39-2.65,9.06,9.06,0,0,0-7.67,13.86l.22,1-.92,2.66,3.43-.9.33.2a9.06,9.06,0,0,0,4.6,1.26h0a9.05,9.05,0,0,0,6.39-15.45ZM309.64,401a3.68,3.68,0,0,1-1.71-.11c-.39-.13-.9-.29-1-.57a11.26,11.26,0,0,1-5.15-4.11,5.23,5.23,0,0,1-1.11-2.81c0-1.34,1.09-2,.95-2.27a1,1,0,0,1,.72-.34h.52c.17,0,.4-.06.62.47s.77,1.88.83,2c.23.14.68.3,0,.48-.09.59-.14.3-.27.46s-.29.35-.41.47-.15,1-.12.56a8.18,8.18,0,0,0,1.51,1.88,7.48,7.48,0,0,0,2.19,1.35c.27.14.43.11.59-.07s.68-.79.86-1.06.36-.23.61-.14,1.59,1.3,1.86.88c.85.14.45.21.52.32a2.22,2.22,0,0,1-.16,1.29C311.25,400.38,310.17,401.16,309.64,401Z" transform="translate(-295.18 -385.29)" />

//         </svg>

//     </span>

// </button>

// <div id="leader-whatsapp-modal" class="leader-whatsapp-modal-popup">

//     <div class="leader-whatsapp-modal-content">

//         <div class="leader-whatsapp-modal-header">

//             <span class="leader-whatsapp-modal-close">&times;</span>

//             <h2 class="leader-whatsapp-h2">שיחת ווטסאפ</h2>

//         </div>

//         <div class="leader-whatsapp-modal-body">

//             <form action="#" method="post" name="whatsapp-form" id="whatsapp-form">

//                 <div class="leader-hidden-inputs"><input type="hidden" name="utm_source" class="utm_class_leader" value="" /><input type="hidden" name="utm_campaign" value="" /> <input type="hidden" name="AgId" value="" /> <input type="hidden" name="utm_term" value="" /> <input type="hidden" name="AdPos" value="" /><input type="hidden" name="utm_content" value="" /><input type="hidden" name="device" value="" /><input type="hidden" name="GeoLoc" value="" /><input type="hidden" name="content_site" value="" /><input type="hidden" name="exone" value="" /><input type="hidden" name="utm_medium" value="" /><input type="hidden" name="gclid" value="" /><input type="hidden" name="fbclid" value="" /><input type="hidden" name="cid" value="" /><input type="hidden" name="lp" value="" /><input type="hidden" name="theurl" value="" /><input type="hidden" name="page_title" value="" /></div>

//                 <script>
//                     $(document).ready(function() {

//                         set_leader_inputs(gt_cc_utm_source);

//                     });
//                 </script>
//                 <input id="leader-whatsapp-visitor-phone" aria-label="Connect to a representative on whatsapp by entering your phone number" name="user_whatsapp_number" placeholder="מספר הטלפון שלך" type="tel" style="width: 260px;margin-left: auto; margin-right: auto;border-radius: 4px;">

//                 <button type="button" id="leader-whatsapp-submit">התחל שיחת ווטסאפ</button>

//             </form>

//         </div>3

//     </div>

// </div>

// <script src="https://sites.leader.online/pixel/xxx.co.il/whatsapp/whatsapp_function.js"></script>  <!-- Your URL goes here  -->
// `;
//   $(whatsapp_popup).html(data);

//////////////////////////////WhatsApp End ////////////////////////////////
