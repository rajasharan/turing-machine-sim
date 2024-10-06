const { createApp, ref, nextTick } = Vue

const app = createApp({
  setup() {
    function _timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const _program = ref({
        'A0': '1RB',
        'A1': '1LB',
        'B0': '1LA',
        'B1': '0LC',
        'C0': '1RH',
        'C1': '1LD',
        'D0': '1RD',
        'D1': '0RA',
    });

    const program_string = ref(JSON.stringify(_program.value, null, 2));

    const _tape = ref({});
    const _start = ref(0);
    const current_state = ref('A');
    const step_count = ref(0);

    const items = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const _mid = ref((items.value.length - 1 ) / 2);
    const right = ref(false);
    const left = ref(false);
    const _pause = ref(false);
    const running = ref(false);
    const reset_pressed = ref(false);

    async function _step() {
      const inp = _tape.value[`${_start.value}`] || '0';
      const cc = _program.value[`${current_state.value}${inp}`];
      if (!cc) {
          console.log(`force halting at: ${current_state.value}${inp}`);
          return false;
      }

      const out = cc[0];
      const dir = cc[1];
      const new_state = cc[2];

      _tape.value[`${_start.value}`] = out;
      if (dir === 'L') {
          _start.value -= 1;
          _tapeHeadLeftStart(out);
          await _timeout(1300);
          _tapeHeadLeftStop();
      } else {
          _start.value += 1;
          _tapeHeadRightStart(out);
          await _timeout(1300);
          _tapeHeadRightStop();
      }

      current_state.value = new_state;
      console.log('tape:', _tape.value, _start.value);

      if (new_state === 'H') {
          console.log(`normal halting at: ${cc}`);
          return false;
      }

      return true;
    }

    function _tapeHeadRightStart(val) {
      if (!right.value) {
        console.log('animationR start');
        items.value[_mid.value] = parseInt(val);
        right.value = true;
      }
    }

    function _tapeHeadRightStop() {
      if (right.value) {
        console.log('animationR stop');
        right.value = false;
        first = items.value.shift();
        items.value = items.value.concat(first);
        syncTape();
      }
    }

    function _tapeHeadLeftStart(val) {
      if (!left.value) {
        console.log('animationL start');
        items.value[_mid.value] = parseInt(val);
        left.value = true;
      }
    }

    function _tapeHeadLeftStop() {
      if (left.value) {
        console.log('animationL stop');
        left.value = false;
        last = items.value.pop();
        items.value = [last].concat(items.value);
        syncTape();
      }
    }

    function syncTape() {
      for (let i=0; i <= 7; i++) {
        items.value[_mid.value + i] = parseInt(_tape.value[`${_start.value + i}`] || '0');
      }
      for (let i=-1; i >= -7; i--) {
        items.value[_mid.value + i] = parseInt(_tape.value[`${_start.value + i}`] || '0');
      }
    }

    async function start_stop() {
      if (!_pause.value) {
        _pause.value = true;
        return;
      }

      if (_pause.value) {
        _pause.value = false;
        await run();
      }
    }

    async function run() {
      running.value = true;
      reset_pressed.value = false;
      while (running.value) {
        const ret = await _step();
        step_count.value += 1;
        await nextTick();
        await _timeout(300);
        if (!ret) {
          return;
        }
      }
      // await _step();
    }

    async function reset() {
      running.value = false;
      _tape.value = {};
      _start.value = 0;
      current_state.value = 'A';
      step_count.value = 0;

      items.value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      _mid.value = (items.value.length - 1 ) / 2;
      right.value = false;
      left.value = false;
      running.value = false;
      reset_pressed.value = true;
      await nextTick();
    }

    async function pause() {
      running.value = !running.value;
      if (running.value) {
        await run();
      }
      console.log(running.value);
    }

    return {
      items,
      right,
      left,
      run,
      current_state,
      start_stop,
      step_count,
      reset,
      pause,
      running,
      reset_pressed,
      program_string,
    };
  },
}).mount('#app')
