const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { searchstatService } = require('../services');

const getStats = catchAsync(async (req, res) => {
  const { lang } = req.query;
  
  try {
    // Cache key oluştur
    const cacheKey = `stats_${lang}_${new Date().toISOString().split('T')[0]}`;
    
    // Redis'ten cache kontrol et (eğer Redis varsa)
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return res.status(httpStatus.OK).send(JSON.parse(cached));
    // }
    
    const latest = await searchstatService.latestByLang(lang);
    const most = await searchstatService.mostByLang(lang);
    const inserted = await searchstatService.lastAddedGundem(lang);
    
    const result = { latest, most, inserted };
    
    // Cache'e kaydet (1 saat)
    // await redisClient.setex(cacheKey, 3600, JSON.stringify(result));
    
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.error('getStats error:', error.message);
    // Fallback data if stats fail
    res.status(httpStatus.OK).send({ 
      latest: [], 
      most: [], 
      inserted: [] 
    });
  }
});

const allStats = catchAsync(async (req, res) => {
  const stat = await searchstatService.allStats();
  res.status(httpStatus.CREATED).send(stat);
});

const getUserSearchHistory = catchAsync(async (req, res) => {
  const userId = req.user.id || req.user._id;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Kullanıcı giriş yapmamış' });
  }

  const pick = require('../utils/pick');
  const filter = { userId };
  // Sadece ilksorgu ve advanced aramaları göster (exactwithdash ve maddeanlam hariç)
  filter.searchType = { $in: ['ilksorgu', 'advanced', 'exact'] };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) {
    options.sortBy = 'createdAt:desc';
  }
  if (!options.limit) {
    options.limit = 50;
  }

  const result = await searchstatService.querySearchstat(filter, options);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getStats,
  allStats,
  getUserSearchHistory,
};
