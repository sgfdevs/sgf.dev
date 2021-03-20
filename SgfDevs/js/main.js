$(function() {
    $('.something').on('click', function () {
        console.log("Horsin' Around");
    });
    
    $('.scroll_trigger').on('click', function () {
        let scrollTrigger = $(this);
        let screenWidth = $(window).width();
        let scrollContainer = $('.scroll', $(this).parent());
        let scrollContainerWidth = scrollContainer[0].scrollWidth;
        let scrollAmount = $(this).hasClass('scroll_right') ? 300 : -300;
        let scrollContainerLeftPosition = scrollContainer.scrollLeft();
        let firstScrollItem = $('.card:first-child');
        
        scrollContainer.css('scroll-snap-type', 'none');
        
        scrollContainer.stop().animate({scrollLeft: scrollContainerLeftPosition + scrollAmount}, 100, function () {
            scrollContainer.css('scroll-snap-type', 'x mandatory');

            let scrollItemLeftPosition = Math.abs(firstScrollItem.offset().left) + screenWidth;
            let endEdgeDiff = Math.abs(scrollItemLeftPosition - scrollContainerWidth) - 50;
            let startingEdgeDiff = Math.abs(scrollItemLeftPosition - screenWidth) - 50;

            $('.scroll_trigger').removeClass('disabled');
            
            if(!endEdgeDiff) {
                console.log('at the end');
                scrollTrigger.addClass('disabled');
            }
            else if(!startingEdgeDiff) {
                console.log('at the beginning');
                scrollTrigger.addClass('disabled');
            }
        });
        
        return false;
    });

    $('.checkbox_list input').change(function () {
        let parent = $(this).closest('.checkbox_list');
        let checkboxName = parent.data('name');

        var checkedItems = $('input:checked', parent).map(function (i, e) {
            return $(e).val();
        }).get();

        $('.values', parent).val(checkedItems.join(','));
    });

    $('.sgf_toggle input').change(function () {
        let toggle = $(this);

        if (toggle.is(':checked')) {
            toggle.val('1');
        } else {
            toggle.val('0');
        }
    });

    $('#updates_subscribe').on('submit', function (e) {
        var emailAddress = $('#email').val();

        if (validateEmail(emailAddress)) {
            $.post($(this).attr('action'), $(this).serialize()).done(function (data) {
                $('#email').val('');
                swal('You Are Awesome', "Thanks for signing up for updates. You'll be hearing from us soon!", 'success');
            });
        } else {
            swal('Whoops', 'Something went wrong... Please double check that your email address is valid. And if so, yell at us on the Twitter and tell us our stuff is broken.', 'error');
        }

        //e.preventDefault();
        return false;
    });

    $('.null_check_hint').on('click', function () {
        swal('The answer is SGF', "This is an attempt to crack down on spam submissions. Hopefully it works and you are not a robot sniffing out the answer to this riddle. Welp. See ya later.", 'success');
    });

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    $('#mobile-nav-toggle').click(function () {
        $('.nav-icon').first().toggleClass('open');
        $('#mobile_nav').toggleClass('nav-hidden');
        $('body').toggleClass('fixed');
    });

    $('#mobile_nav_about').click(function () {
        $('.mobile-nav__about').removeClass('nav-hidden');
        $('#mobile-nav__about ul li:first-child').focus();
    });

    $('#mobile_nav_back').click(function () {
        $('.mobile-nav__about').addClass('nav-hidden');
        $('#mobile-nav ul li:first-child').focus();

    });
});