import { createBaseResolver } from '../../base/base.resolver';
import { RefreshTokenModel } from './refreshToken.model';

const {
  BaseResolver: BaseRefreshTokenResolver,
  BasePayload: BaseRefreshTokenPayload,
} = createBaseResolver<RefreshTokenModel>(RefreshTokenModel, {
  action: {
    read: { active: false },
    create: { active: false },
    update: { active: false },
    remove: { active: false },
  },
});

export { BaseRefreshTokenResolver, BaseRefreshTokenPayload };
