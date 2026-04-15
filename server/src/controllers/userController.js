export async function getProfile(req, res) {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      isEmailVerified: req.user.isEmailVerified,
      astrologyData: req.user.astrologyData,
      chatCredits: req.user.chatCredits,
      isSubscribed: req.user.isSubscribed,
      subscriptionExpiry: req.user.subscriptionExpiry
    }
  });
}

export async function updateAstrologyData(req, res) {
  req.user.astrologyData = req.body;
  if (req.body.fullName) {
    req.user.name = req.body.fullName;
  }
  await req.user.save();

  res.json({
    message: 'Astrology data saved',
    astrologyData: req.user.astrologyData
  });
}
