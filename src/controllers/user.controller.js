const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const createMassUser = catchAsync(async (req, res) => {
  const user = await userService.createMassUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const followUnfollow = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { friendId, toggle } = req.params;
  if (toggle) {
    await userService.addFriend(userId, friendId);
    res.status(200).send({ message: toggle });
  } else {
    await userService.deleteFriend(userId, friendId);
    res.status(200).send({ message: toggle });
  }
});

const getUsers = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name', 'role', 'packetId']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteSet = catchAsync(async (req, res) => {
  await userService.deleteSet(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteSet,
  createMassUser,
  followUnfollow,
};
