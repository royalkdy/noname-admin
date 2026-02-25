import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor() {
    super();
  }

  serializeUser(
    user: { id: number },
    done: (err: Error | null, user?: { id: number }) => void,
  ): void {
    done(null, { id: user.id });
  }

  deserializeUser(
    user: { id: number },
    done: (err: Error | null, user?: { id: number } | null) => void,
  ): void {
    done(null, { id: user.id });
  }
}
