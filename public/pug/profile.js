$(document).ready(function() {
    $(".dropdown-toggle").dropdown();
    $("#del").click(function(){
      var un = $("#un").html();
      
      $.ajax({
            url: "/profile/"+un,
            type: "DELETE",
        error: function (xhr, status, error) {
            alert("Account Deleted!!");
            window.location.replace("/");
            }
        });
    });
   $("#tmp").click(function(){
        var un = $("#un").html();

        $.ajax({
            url: "/profile/"+un,
            type: "PUT",
        error: function (xhr, status, error) {
            alert("Re-Login to reactivate the account");
            window.location.replace("/");
            }
        });

   })
});