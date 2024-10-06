program = {
    'A0': '1RB',
    'A1': '1LB',
    'B0': '1LA',
    'B1': '0LC',
    'C0': '1RH',
    'C1': '1LD',
    'D0': '1RD',
    'D1': '0RA',
};

tape = {};

start = 0;

current_state = 'A';

function step() {
    inp = tape[`${start}`] || '0';
    cc = program[`${current_state}${inp}`];
    if (!cc) {
        console.log(`force halting at: ${current_state}${inp}`);
        return false;
    }

    out = cc[0];
    dir = cc[1];
    new_state = cc[2];

    tape[`${start}`] = out;
    if (dir === 'L') {
        start -= 1;
    } else {
        start += 1;
    }

    current_state = new_state;
    if (new_state === 'H') {
        console.log(`normal halting at: ${cc}`);
        return false;
    }

    console.log('tape:', tape);
    return true;
}
