let io;

const setSocketIO = (socketIO) => {
    io = socketIO;
};

const broadcastDashboardUpdate = (dashboardType, data) => {
    if (io) {
        io.to(dashboardType).emit('dashboard-update', data);
    }
};

module.exports = { setSocketIO, broadcastDashboardUpdate };
