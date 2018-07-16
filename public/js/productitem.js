/*$(document).ready(function(){
    $('.delete-article').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
        type:'DELETE',
        url: '/productitem/'+id,
        success: function(response){
        alert('Deleting Article');
        window.location.href='/';
        },
        error: function(err){
        console.log(err);
        }
    });
    });
});
var alert
$(document).ready(function(){
    $('#accept-offer').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
        type:'POST',
        url: '/productitem/'+id,
        success: function(response){
        alert('Accepting Offer');
        window.location.href='/';
        },
        error: function(err){
        console.log(err);
        }
    });
});

});
$(document).ready(function(){
    $('#reject-offer').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
        type:'POST',
        url: '/productitem/'+id,
        success: function(response){
        alert('Rejecting Offer');
        window.location.href='/';
        },
        error: function(err){
        console.log(err);
        }
    });
});
$(document).ready(function(){
    $('#send-offer').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
        type:'POST',
        url: '/productitem/'+id,
        success: function(response){
        alert('Sent an Offer');
        window.location.href='/';
        },
        error: function(err){
        console.log(err);
        }
    });
});
});
}); */