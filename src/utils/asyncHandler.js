// by promise we taking the job
const asyncHandler = (reqHandler) =>{
    (req,res,next) =>{
        Promise.resolve(reqHandler(req,res,next)).catch((err) => next(err))
    }
}

export { asyncHandler }


//using the higer ordr functions , functions are rthe function as the arugmetn or return the functions

//const asyncHandler = (Fn) => () => {}
//const asyncHandler = (func) => {() => {}}  // in the arrow function for single line we need to use the cusrly brace so are using the like lne 10
//const asyncHandler = (Fn) => async() => {}  // asyn function

// by using the asyc handler we are looking for the job
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })

//     }
// }