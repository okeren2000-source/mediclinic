jQuery(document).ready(function () {
  // process the form
  var phoacc = "leader";
  jQuery("form#leader-callback-form").submit(function (event) {
    jQuery(".form-group").removeClass("has-error"); // remove the error class
    jQuery(".help-block").remove(); // remove the error text
    jQuery(".alert").remove(); // remove the error text
    //$('#submitbtn').hide();
    jQuery("#leader-callback-form #loading").addClass(
      "glyphicon glyphicon-refresh glyphicon-refresh-animate jk-reload"
    ); // add loadin class to button
    // get the form data
    var formData = {
      phoacc: phoacc,
      Phone: jQuery("input[name=lcbnPhone]").val(),
      cbfnum: jQuery("input[name=cbfnum]").val(),
    };
    // send the form Data
    jQuery
      .ajax({
        type: "POST", // define the type of HTTP verb we want to use (POST for our form)
        url: "https://sites.leader.online/proxy/process.php", // the url where we want to POST
        data: formData, // our data object
        dataType: "json", // what type of data do we expect back from the server
        encode: true,
      })
      // using the done promise callback
      .done(function (data) {
        // log data to the console so we can see
        // here we will handle errors and validation messages
        if (!data.success) {
          jQuery("#leader-callback-form #loading").removeClass(
            "glyphicon glyphicon-refresh glyphicon-refresh-animate jk-reload"
          ); // remove loadin class to button
          // handle errors for name ---------------
          if (data.errors.Phone) {
            jQuery("#leader-callback-form #Phone-group").addClass("has-error"); // add the error class to show red input
            jQuery("#leader-callback-form #Phone-group").append(
              '<div class="help-block" aria-label="' +
                data.errors.Phone +
                '" tabindex="5">' +
                data.errors.Phone +
                "</div>"
            ); // add the actual error message under our input
            jQuery(".help-block").focus();
          }
          if (data.errors.badnumber) {
            jQuery("form#leader-callback-form").append(
              '<div id="callback-badnumber-alert" class="alert alert-danger" aria-label="' +
                data.errors.badnumber +
                '" tabindex="7">' +
                data.errors.badnumber +
                "</div>"
            );

            jQuery("#callback-badnumber-alert").focus();
          }
        } else {
          jQuery("#leader-callback-form #loading").removeClass(
            "glyphicon glyphicon-refresh glyphicon-refresh-animate jk-reload"
          ); // remove loadin class to button
          //$('#submitbtn').hide();
          // ALL GOOD! just show the success message!
          jQuery("form#leader-callback-form").append(
            '<div id="callback-number-accepted" class="alert alert-success" aria-label="' +
              data.message +
              '" tabindex="8">' +
              data.message +
              "</div>"
          );
          jQuery("#callback-number-accepted").focus();
          // usually after form submission, you'll want to redirect
          // window.location = '/thank-you'; // redirect a user to another page
          //alert('success'); // for now we'll just alert the user
        }
      });
    // stop the form from submitting the normal way and refreshing the page
    event.preventDefault();
  });
});
// Start: Scripts for the popup trigger
jQuery("a.lcbn-pop.button.desktop-phone-btn").on("click", function () {
  jQuery(".lcbn-pop-wrap, a.lcbn-pop.button.desktop-phone-btn").toggleClass(
    "active"
  );
  jQuery("#boxclose").focus();
  setTimeout(function () {
    jQuery("input[name='lcbnPhone']").focus();
  }, 200);
  return false;
});
jQuery("a#boxclose").on("click", function () {
  jQuery(".lcbn-pop-wrap, a.lcbn-pop.button.desktop-phone-btn").removeClass(
    "active"
  );
  return false;
});
jQuery("a#boxclose").keypress(function (e) {
  if (e.keyCode == 13) jQuery("a#boxclose").click();
});
// End: Scripts for the popup trigger

jQuery("input[name='cbfnum']").val(number_to_display);

jQuery("a[href='tel:']").each(function () {
  this.href = this.href.append("number_to_display");
});

$("a.mobile-phone-btn").attr("href", "tel:" + number_to_display);
