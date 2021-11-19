module.exports={
    productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
    pages:{
        index:{
            entry:'./examples/main.js',
        }
    }
}