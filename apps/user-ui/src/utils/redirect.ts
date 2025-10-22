let redirectTologin = ()=>{
    window.location.href ='/login';
}

export const setRedirectHandler =(handler :()=> void )=>{
    redirectTologin();
}

export const runRedirectToLogin =()=>{
    redirectTologin();
}

