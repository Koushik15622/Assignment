function validate()
{
    var p1=$("#p1").val(),p2=$("#p2").val(),un=$("#un").val(),em=$("#em").val(),f=0;
        if(p1.length<6)
        {
            toastr.error("Password should be minimum of 6 letters");
            f=1;
        }
        else if(p1!=p2)
        {
            toastr.error("Passwords did not match");
            f=1;
        }
        else if(un.length<6)
        {
            toastr.error("Username should be minimum of 6 letters");
            f=1;
        }
        else if(f==0)
        {
            var data = {username:un,email:em,password:p1}
            $.ajax({
                url:"/register",
                type:"POST",
                data:data,
                success: function(){
                    console.log("account created");
                    location.replace("/profile");
                },
                error: function(){
                    alert("error");
                }
            })
        }
}