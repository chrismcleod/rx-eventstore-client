import { Socket } from 'net';
import { Subject } from 'rxjs';

export const write$ = (connection: Socket) => {
  const subject = new Subject<Buffer>();
  subject.subscribe((buffer) => connection.write(buffer));
  return subject;
};
