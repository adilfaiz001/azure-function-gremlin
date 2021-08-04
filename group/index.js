const Controller = require('../controllers/controller');

module.exports = function (context, req) {
    if(context.req.method === 'GET') {
        
    } else if(context.req.method === 'POST') {
        let data = req.body;

        Controller.addVertex_Group(data).then(response => {
            context.res = {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
                body: response
            };
    
            context.done();
        }).catch(error => {
            context.res = {
                status: 500,
                body: error
            };
    
            context.done();
        });
    }
}