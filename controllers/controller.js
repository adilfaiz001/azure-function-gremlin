const Gremlin = require('gremlin');
const config = require("../config");

const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(
    `/dbs/${config.database}/colls/${config.collection}`, 
    config.primaryKey
)

const client = new Gremlin.driver.Client(
    config.endpoint, 
    { 
        authenticator,
        traversalsource : "g",
        rejectUnauthorized : true,
        mimeType : "application/vnd.gremlin-v2.0+json"
    }
);

// MEMBER - CREATE, READ
exports.addVertex_Member = (data) => {
    return new Promise((resolve, reject) => {
        client.open().then(() => {
            client.submit("g.addV(label).property('nodeId', id).property('name', name)", {
                label: "member",
                id: new Date(),
                name: data.name
            }).then((result) => {
                client.close();
                return resolve({
                    status: 1,
                    statusCode: 201,
                    message: "Member added successfully." 
                });    
            }).catch((error) => {
                client.close();
                return reject({
                    status: 0,
                    statusCode: 400,
                    error: "Bad Request"
                });
            });
        }).catch(error => {
            console.log("DB Error");
            reject({
                status: 0,
                statusCode: 500,
                message: "Database connection failed",
                error: error.message
            });
        });
    });
}

// GROUP - CREATE, READ
exports.addVertex_Group = (data) => {
    return new Promise((resolve, reject) => {
        client.open().then(() => {
            client.submit("g.addV(label).property('nodeId', id).property('name', name)", {
                label: "group",
                id: new Date(),
                name: data.name
            }).then((result) => {
                client.close();
                return resolve({
                    status: 1,
                    statusCode: 201,
                    message: "Group created successfully." 
                });    
            }).catch((error) => {
                client.close();
                return reject({
                    status: 0,
                    statusCode: 400,
                    error: "Bad Request"
                });
            });
        }).catch(error => {
            reject({
                status: 0,
                statusCode: 500,
                message: "Database connection failed",
                error: error.message
            });
        });
    });
}

// SYSTEM
/* Get list of groups */
exports.GetGroups = () => {
    return new Promise((resolve, reject) => {
        client.open().then(() => {
            client.submit("g.V().hasLabel('group')").then((result) => {
                client.close();
                return resolve({
                    status: 1,
                    statusCode: 200,
                    message: "Groups data fetched successfully.",
                    data: result 
                });    
            }).catch((error) => {
                client.close();
                return reject({
                    status: 0,
                    statusCode: 400,
                    error: "Bad Request"
                });
            });
        }).catch(error => {
            reject({
                status: 0,
                statusCode: 500,
                message: "Database connection failed",
                error: error.message
            });
        });
    });
}

/* Add Member to group */
exports.AddEdge_MemberOfGroup = (data) => {
    return new Promise((resolve, reject) => {
        if(data.member && data.group) {
            let memberId = data.member;
            let groupId = data.group;
            console.log("Add Edge");

            client.open().then(() => {
                client.submit("g.V(member).outE(relationship).where(inV().is(group))", {
                    member: memberId,
                    relationship: "MemberOfGroup",
                    group: groupId
                }).then(edge => {
                    if(!edge.length) {
                        client.submit("g.V(member).addE(relationship).to(g.V(group))", {
                            member: memberId,
                            relationship: "MemberOfGroup",
                            group: groupId
                        }).then((result) => {
                            client.close();
                            return resolve({
                                status: 1,
                                statusCode: 201,
                                message: "Member successfully added to group." 
                            });    
                        }).catch((error) => {
                            client.close();
                            return reject({
                                status: 0,
                                statusCode: 400,
                                error: "Bad Request"
                            });
                        });
                    } else {
                        return resolve({
                            status: 0,
                            statusCode: 204,
                            message: "Member already added to group."
                        })
                    }
                });
                
            }).catch(error => {
                reject({
                    status: 0,
                    statusCode: 500,
                    message: "Database connection failed",
                    error: error.message
                });
            });
        } else {
            reject({
                status: 0,
                statusCode: 400,
                message: "Bad Request"
            })
        }
    });
}

/* Remove Memver from Group */
exports.RemoveEdge_MemberOfGroup = (data) => {
    return new Promise((resolve, reject) => {
        if(data.member && data.group) {
            let memberId = data.member;
            let groupId = data.group;

            client.open().then(() => {
                client.submit("g.V(member).outE(relationship).where(inV().is(group))", {
                    member: memberId,
                    relationship: "MemberOfGroup",
                    group: groupId
                }).then(edge => {
                    console.log(edge);
                    console.log(edge.length);
                    if(edge.length) {
                        client.submit("g.V(member).outE(relationship).where(inV().is(group)).drop()", {
                            member: memberId,
                            relationship: "MemberOfGroup",
                            group: groupId
                        }).then((result) => {
                            client.close();
                            return resolve({
                                status: 1,
                                statusCode: 201,
                                message: "Member successfully added to group." 
                            });    
                        }).catch((error) => {
                            client.close();
                            return reject({
                                status: 0,
                                statusCode: 400,
                                error: "Bad Request"
                            });
                        });
                    } else {
                        return resolve({
                            status: 0,
                            statusCode: 204,
                            message: "Member not found in this group."
                        })
                    }
                });
                
            }).catch(error => {
                reject({
                    status: 0,
                    statusCode: 500,
                    message: "Database connection failed",
                    error: error.message
                });
            });
        } else {
            reject({
                status: 0,
                statusCode: 400,
                message: "Bad Request"
            })
        }
    });
}

/* List all groups for a person */
exports.GetGroupsForMember = (data) => {
    return new Promise((resolve, reject) => {
        if(data.member) {
            let member = data.member;

            client.open().then(() => {
                client.submit("g.V(member).outE(relationship).inV()", {
                    member: member,
                    relationship: "MemberOfGroup"
                }).then((result) => {
                    console.log(result);
                    client.close();
                    return resolve({
                        status: 1,
                        statusCode: 200,
                        message: "Groups list for member fetched successfully.",
                        data: result 
                    });    
                }).catch((error) => {
                    console.log(error);
                    client.close();
                    return reject({
                        status: 0,
                        statusCode: 400,
                        error: "Bad Request"
                    });
                });
            }).catch(error => {
                reject({
                    status: 0,
                    statusCode: 500,
                    message: "Database connection failed",
                    error: error.message
                });
            });
        } else {
            reject({
                status: 0,
                statusCode: 400,
                message: "Bad Request"
            })
        }
    });
}