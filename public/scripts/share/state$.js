function o(t){let T=[];return{get get(){return t},set set(e){t=e,T.forEach(f=>f(e))},setter(e){t=e(t),T.forEach(f=>f(t))},addEffect(e,f=!1){T.push(e),f&&e(t)}}}export{o as state$};
