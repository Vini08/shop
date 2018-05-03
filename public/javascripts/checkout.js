Stripe.setPublishableKey('pk_test_BoeXQgFrQjaKGEs9DfAb0QNQ');
var $form = $('#checkout-form');

$form.submit(function (event) {
    $('#charge-error').addClass('hidden');
    $form.find('button').prop('disabled', true);
        stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#expiration-month').val(),
        exp_year: $('#expiration-year').val(),
        name: $('#name').val()
        },stripeResponseHandler);
        return false;
});

function stripeResponseHandler(status, response) {
    if(response.error){
        $('#charge-error').text(response.error.message);
        $('#charge-error').removeClass('hidden');
        $form.find('button').prop('disabled',false);

    }else{
        var token = response.id;
        $form.append($('<input type="hidden" name="stripeToken"/>').val(token));
        $form.get(0).submit();
    }

}
