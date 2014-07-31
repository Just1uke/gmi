jQuery.extend({
  postJSON: function(url, data, callback, errorCallback) {
    $.ajax({url: url,
            type: 'POST',
            contentType: 'application/json', dataType: 'json',
            data: JSON.stringify(data),
            processData: false,
            success: callback,
            error: errorCallback});
  }
});

function hotKeys(event) {
  if(event.keyCode == 27) {
    closePopUpWindow('popup_info', 'overlay');
  }
}

function ajaxError(jqXHR, textStatus, errorThrown) {
  popUp = createPopUp('Error', 'Message',
                      '<p>An error has occurred, please contact customer support and include the text below:</p><br /><div id="serverErrorText" class="scroll-pane-arrows" style="height:300px;max-width:513px;border:dashed 1px;margin-left:3px"></div>', 
                      'popup_info_error_window', 
                      'overlay_error_window');
    
    var element = jQuery('#serverErrorText', popUp).jScrollPane({
      showArrows: true,
      horizontalGutter: 10
    });
    
    var api = element.data('jsp');
    api.getContentPane().html(jqXHR.responseText);
    api.reinitialise();
}

function canClickOnce(button)
{
  if (!button) return true;
  if ($(button).data('clickedOnce') == true) return false;
  return true;
}

function applyClickOnce(button)
{
  if (!button) return true;
  if ($(button).data('clickedOnce') == true) return false;
  $(button).data('clickedOnce', true)
  
  var left = jQuery('div[class^="button_left"]', button);
  left.attr("class", "button_left_disabled");
  var center = jQuery('div[class^="button_center"]', button);
  center.attr("class", "button_center_disabled");
  var right = jQuery('div[class^="button_right"]', button);
  right.attr("class", "button_right_disabled");
  
  return true;
}

function freeClickOnce(button)
{
  if (!button) return;
  $(button).data('clickedOnce', false);
  
  var left = jQuery('div[class^="button_left"]', button);
  left.attr("class", "button_left");
  var center = jQuery('div[class^="button_center"]', button);
  center.attr("class", "button_center");
  var right = jQuery('div[class^="button_right"]', button);
  right.attr("class", "button_right");
}

/**
* This function will change the div ids of a button. 
* It is important that you have made 3 div tag ids in your css file named:
* button_left, button_center, button_right
* button_left_pressed, button_center_pressed, button_right_pressed
* Param 1: The button you want to change.
**/
function clickedButton(button, out)
{
  if (!canClickOnce(button)) return true;

  var suffix = "";
  if (! out == true)
  {
    if (!button.pressed)
      suffix = "_pressed";
  } else {
    if (!button.pressed)
      return true;
  }
    
  var left = jQuery('div[class^="button_left"]', button);
  left.attr("class", "button_left" + suffix);
  var center = jQuery('div[class^="button_center"]', button);
  center.attr("class", "button_center" + suffix);
  var right = jQuery('div[class^="button_right"]', button);
  right.attr("class", "button_right" + suffix);

  button.pressed = !button.pressed;

  return true;
}

function searchForItem(divId, url, e, imgUrl) {
  if(e.which == 13 || e==true)
  {
    $('#plussMinus').attr('src', imgUrl);
    $('#plussMinus').attr('status', 'pluss');
    $('#selectSlot').css('display', 'none');
    
    $('#plussMinus2').attr('src', imgUrl);
    $('#plussMinus2').attr('status', 'pluss');
    $('#orderSearch').css('display', 'none');

    var item_name = document.getElementsByName("ItemName");
    var category = document.getElementsByName("category");
    var orders = document.getElementsByName("orders");
    var minQL = document.getElementsByName("minQL");
    var maxQL = document.getElementsByName("maxQL");
    var minPrice = document.getElementsByName("minPrice");
    var maxPrice = document.getElementsByName("maxPrice");
    
    var placement = 0xffffffff;
    if ($('input[name="slot"]').filter(':not(:checked)').length > 0) {
      placement = 0;
      $('input[name="slot"]:checked').each(function() {
          placement |= $(this).val();
        });
    }

    var data = {'search' : true,
                'name': item_name[0].value,
                'category': category[0].value,
                'placement': placement,
                'order_mode': orders[0].value,
                'ql_low': minQL[0].value,
                'ql_high': maxQL[0].value,
                'price_low': minPrice[0].value,
                'price_high': maxPrice[0].value};

    var url = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.location = url + "?" + jQuery.param(data);
  }
}

function updateDiv(divId, url, data) {
    jQuery.postJSON(url, data, reply(divId), ajaxError);
}

function reply(divId) {
  return function(response, text_status, jqXHR) {
    $('#resultHeader').css("display", "block");
    
    var element = $('#result').jScrollPane({
      showArrows: true,
      autoReinitialise: true,
      horizontalGutter: 10
    });
    
    var api = element.data('jsp');
    api.getContentPane().html(response["html"]);
    api.reinitialise();
    
  }
}

/**
* 
* Param 1: The id name of the pop up window.
* Param 2: The id name of the overlay window.
* Param 3: URL to the page you want to display in the pop up window.
**/
function getPage(popupWindowName, overlayName, url, data, dataToUpdate, readyFunc) {
  jQuery.postJSON(url, data, itemReply(popupWindowName, overlayName, dataToUpdate, readyFunc), ajaxError);
}

function itemReply(popupWindowName, overlayName, dataToUpdate, readyFunc) {
  return function(response, text_status, jqXHR) {
      if ("redirect" in response) {
        if (response["banner_text"] != false) {
          location.href=response["redirect"]+"?banner_text="+response["banner_text"];
        }
        else {
          location.href=response["redirect"];
        }
        return;
      }
      //Adding a black overlay to the page
      overlay = document.getElementById(overlayName);
      if (!overlay) {
        overlay = document.createElement('div'); 
        overlay.id = overlayName;
        document.body.appendChild(overlay);
      }
      
      //Adding a new pop-up to the page
      var popUpCreated = false;
      var popUp = document.getElementById(popupWindowName);
      if (!popUp) {
        var popUp = document.createElement('div'); 
        popUp.id = popupWindowName;
        popUpCreated = true;
      }
      popUp.innerHTML = response["html"];
      if (popUpCreated) {
        document.body.appendChild(popUp);
      }
      var height = popUp.offsetHeight;
      popUp.style.marginTop = -(height/2) + "px";
      
      for(a in dataToUpdate.replace) {
        //console.log(a);
        //console.log(dataToUpdate.replace[a]);
        if (typeof(dataToUpdate.replace[a]) == "function") {
          jQuery('#' + a, popUp).html(dataToUpdate.replace[a]())
        } else {
          jQuery('#' + a, popUp).html(dataToUpdate.replace[a])
        }
      }

      //creates a close button placed on the top right of the pop up window.
      var close = document.createElement('div'); 
      close.className = "xbutton";
      close.onclick = Function("closePopUpWindow('" + popupWindowName + "','" + overlayName + "')");
      popUp.appendChild(close);
      
      //create scrollbars
      $('.popup-scroll-pane-arrows').jScrollPane(
        {
          showArrows: true,
          horizontalGutter: 10,
          contentWidth: 500
        }
      );
      
      if (readyFunc) {
        readyFunc();
      }
    }
}

function createPopUp(heading, subHeading, text, windowName, overlayName) {
  //Adding a black overlay to the page
  var overlay = document.createElement('div'); 
  overlay.id = overlayName;
  document.body.appendChild(overlay);

  //Adding a new pop-up to the page
  var popUp = document.createElement('div'); 
  popUp.id = windowName;
  popUp.innerHTML = '<div id="popup_main_header"><h2>' + heading + '</h2></div><div id="popup_body"><div class="popup_header"><h3>' + subHeading + '</h3></div><br />' + text + '</div>';
  document.body.appendChild(popUp);
  var height = popUp.offsetHeight;
  popUp.style.marginTop = -(height/2) + "px";

  //creates a close button placed on the top right of the pop up window.
  var close = document.createElement('div'); 
  close.className = "xbutton";
  close.onclick = Function("closePopUpWindow('" + windowName + "','" + overlayName + "')");
  popUp.appendChild(close);
  
  return popUp;
}

function warningPopUp(warningText, popupWindowName, overlayName) {
  createPopUp('Warning', 'Message', warningText, popupWindowName, overlayName)
}

function statusReply(errorTextElementId, button, count, page, itemName, text) {
  return function(response, text_status, jqXHR) {
    var status = response['status'];
    var date= new Date();
    var hrs = date.getHours();
    var min = date.getMinutes();
    if (hrs <10) {
      hrs = "0"+hrs;
    }
    if (min <10) {
        min = "0"+min;
    }
    var timestamp = hrs +":"+ min;
    if (status == false) {
      $('#' + errorTextElementId).html("<p class=\"redTextColor\">Error: " +response['message'] + "</p>");
      // On error, enable the button again to allow the user to try again
      if (typeof button != "undefined") {
        freeClickOnce(button);
      }
    }
    else if (typeof count != "undefined" && typeof page != "undefined" && typeof itemName != "undefined" && typeof text != "undefined" ) {
      closePopUpWindow('popup_info', 'overlay');
      if (count == 1) {
        window.location =page + "?banner_text=At " + timestamp + " you " + text + " " + count + " unit of " + itemName + ".";
      } else {
        window.location =page + "?banner_text=At " + timestamp + " you " + text + " " + count + " units of " + itemName + ".";
      }
    } 
    else if (typeof count != "undefined" && typeof page != "undefined" && typeof itemName == "undefined" && typeof text == "undefined" ) {
      closePopUpWindow('popup_info', 'overlay');
      if (count == 1) {
        window.location = page + "?banner_text=At " + timestamp + " you withdrew " + count + " credit."; 
      } else {
        window.location = page + "?banner_text=At " + timestamp + " you withdrew " + count + " credits."; 
      }
    }
    else {
      closePopUpWindow('popup_info', 'overlay');
      var url = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.location = url;
    }
  }
}

function sellToBuyOrder(url, orderId, openPage, itemName, button) {
  if (!applyClickOnce(button)) return;
  
  var itemCount = $('#selctUnits').val();
  var slotNum = $('#slotNumber').text();

  var data = {'item_count': itemCount,
              'slot_num': slotNum,
              'order_id': orderId};

  jQuery.postJSON(url, data, statusReply("errorText", button, itemCount, openPage, itemName, 'sold'), ajaxError);
}

function buyFromSellOrder(url, orderId, button) {
  if (!applyClickOnce(button)) return;
  
  var itemCount = $('#orderUnits').val();

  var data = {'item_count': itemCount,
              'order_id': orderId};

  jQuery.postJSON(url, data, statusReply("buyOrderErrorText", button), ajaxError);
}

function withdrawItem(url, itemCount, slotNum, openPage, itemName, button) {
  if (!applyClickOnce(button)) return;
  
  var data = {'item_count': itemCount,
              'slot_num': slotNum};

  jQuery.postJSON(url, data, statusReply("withdrawItemErrorText", button, itemCount, openPage, itemName, 'withdrew'), ajaxError);
}

function withdrawCash(url, amount, openPage, button) {
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'amount': amount}, statusReply("withdrawCashErrorText", button, amount, openPage),ajaxError);
}

function redeemCode(url, code, openPage, button) {
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'code': code}, statusReply("redeemCodeErrorText", button), ajaxError);
}

function useItem(url, itemType, openPage, itemName, button) {
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'item_type': itemType}, statusReply("useItemErrorText", button), ajaxError);
}

function cancelOrder(url, orderId, button) {
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'order_id': orderId}, statusReply("cancelErrorText", button), ajaxError);
}

function createSellOrder(url, clusterId, templateQL, unitPrice, itemCount, orderDuration, button)
{
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'cluster_id': clusterId, 'template_ql': templateQL, 'unit_price': unitPrice, 'item_count': itemCount, 'order_duration': orderDuration}, statusReply("createSellErrorText", button), ajaxError);
}

function createBuyOrder(url, clusterId, qlLow, qlHigh, unitPrice, itemCount, orderDuration, button)
{
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'cluster_id': clusterId, 'ql_low': qlLow, 'ql_high': qlHigh,'unit_price': unitPrice, 'item_count': itemCount, 'order_duration': orderDuration}, statusReply("createBuyErrorText", button), ajaxError);
}

function createDropDownSelect(selectID, selectValueMap, selectOnChangeScript) {
  var html = "<select id=" + selectID + " onchange=\"" + selectOnChangeScript + "\">";
  for (key in selectValueMap) {
    html += "  <option value=\"" + selectValueMap[key] + "\">" + key + "</option>";
  }
  html += "</select>";
  return html;
}

function createMinMaxDropDownSelect(selectID, minValue, maxValue, selectOnChangeScript)
{
  var values = {};
  for (var i = minValue; i <= maxValue; i++) {
    values[i] = i;
  }
  return createDropDownSelect(selectID, values, selectOnChangeScript);
}

function getMinMaxDropDownSelectGenerator(selectID, minValue, maxValue, selectOnChangeScript)
{
  return function() { return createMinMaxDropDownSelect(selectID, minValue, maxValue, selectOnChangeScript); }
}

function replaceHTML(id, html) {
  var elementId = document.getElementById(id);
  elementId.innerHTML = html;
}

/**
* This function will remove two specified div files from the website.
* Param 1: The id name of the pop up window.
* Param 2: The id name of the overlay window.
**/
function closePopUpWindow(popupWindowName, overlayName) {
  var popupWindow = document.getElementById(popupWindowName);
  if (popupWindow != null) {
    popupWindow.parentNode.removeChild(popupWindow);
  }
  
  var overlay = document.getElementById(overlayName);
  if (overlay != null) {
    overlay.parentNode.removeChild(overlay);
  }
  
}

function highlight(radioButton) {
  var tr = $(radioButton).parent().parent();
  jQuery(".highlight", tr.parent()).attr('class', '');
  tr.attr('class', 'highlight');
}

function calculateTax(price, taxMultiplier, taxCap)
{
  var tax = price * taxMultiplier;
  return Math.min(tax, taxCap);
}

function calculateOrderTotals(priceSelector, unitsSelector, taxMultiplierSelector, taxCapSelector, totalTaxSelector, totalPriceSelector)
{
  var price = Globalize.parseInt($(priceSelector).text());
  var units = Globalize.parseInt($(unitsSelector).val());
  var taxMultiplier = Globalize.parseFloat($(taxMultiplierSelector).text()) / 100.0;
  var taxCap = Globalize.parseInt($(taxCapSelector).text());

  var totalPrice = price * units;
  var tax = calculateTax(totalPrice, taxMultiplier, taxCap);
  totalPrice = totalPrice - tax;
  
  $(totalTaxSelector).html(Globalize.format(tax, "n0"));
  $(totalPriceSelector).html(Globalize.format(totalPrice, "n0"));
}

function calculateAdjustmentFee(oldPrice, newPrice, units, adjustmentFeePercentage, adjustmentFeeMinimum)
{
  var diffPrice = newPrice - oldPrice;
  var fee = diffPrice * units * (adjustmentFeePercentage / 100.0);
  if (fee < adjustmentFeeMinimum) {
    fee = adjustmentFeeMinimum;
  }
  return fee;
}

function calculateSellAdjustmentFee(originalPriceSelector, newPriceSelector, unitsSelector, adjustmentFeePercentageSelector, adjustmentFeeMinimumSelector, totalFeeSelector)
{
  var oldPrice = Globalize.parseInt($(originalPriceSelector).text());
  var newPrice = Globalize.parseInt($(newPriceSelector).val());
  var units = Globalize.parseInt($(unitsSelector).text());
  var adjustmentFeePercentage = Globalize.parseFloat($(adjustmentFeePercentageSelector).text());
  var adjustmentFeeMinimum = Globalize.parseInt($(adjustmentFeeMinimumSelector).text());
  
  var fee = calculateAdjustmentFee(oldPrice, newPrice, units, adjustmentFeePercentage, adjustmentFeeMinimum);
  
  $(totalFeeSelector).html(Globalize.format(fee, "n0"));
}

function calculateBuyAdjustmentFee(originalPriceSelector, newPriceSelector, unitsSelector, adjustmentFeePercentageSelector, adjustmentFeeMinimumSelector, totalFeeSelector, priceDeltaSelector, totalSelector)
{
  var oldPrice = Globalize.parseInt($(originalPriceSelector).text());
  var newPrice = Globalize.parseInt($(newPriceSelector).val());
  var units = Globalize.parseInt($(unitsSelector).text());
  var adjustmentFeePercentage = Globalize.parseFloat($(adjustmentFeePercentageSelector).text());
  var adjustmentFeeMinimum = Globalize.parseInt($(adjustmentFeeMinimumSelector).text());
  
  var fee = calculateAdjustmentFee(oldPrice, newPrice, units, adjustmentFeePercentage, adjustmentFeeMinimum);
  var priceDelta = (newPrice - oldPrice) * units;
  var total = priceDelta + fee;
  
  $(totalFeeSelector).html(Globalize.format(fee, "n0"));
  $(priceDeltaSelector).html(Globalize.format(priceDelta, "n0"));
  $(priceDeltaSelector).attr('class', ((priceDelta < 0) ? 'greenInline' : 'redInline'));
  $(totalSelector).html(Globalize.format(total, "n0"));
  $(totalSelector).attr('class', ((total < 0) ? 'greenInline' : 'redInline'));
}

function modifySellOrder(url, orderId, unitPrice, button)
{
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'order_id': orderId, 'unit_price': unitPrice}, statusReply("modifySellErrorText", button), ajaxError);
}

function modifyBuyOrder(url, orderId, unitPrice, button)
{
  if (!applyClickOnce(button)) return;
  jQuery.postJSON(url, {'order_id': orderId, 'unit_price': unitPrice}, statusReply("modifyBuyErrorText", button), ajaxError);
}