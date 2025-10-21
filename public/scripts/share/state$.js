function c(t){let T=[];return{get get(){return t},set set(e){t=e,T.forEach(f=>f(e))},addEffect(e,f=!1){T.push(e),f&&e(t)}}}export{c as state$};
