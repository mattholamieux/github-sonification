$(function() {
    let username;
    let loop;
    let pattern;
    let chords = [];

    const notes = [
        "C1", "E1", "D1", "B1", "A1", "G1",
        "C2", "E2", "D2", "B2", "A2", "G2",
        "C3", "E3", "D3", "B3", "A3", "G3",
        "C4", "E4", "D4", "B4", "A4", "G4",
        "C5", "E5", "D5", "B5", "A5", "G5"
    ];

    const sampler = new Tone.Sampler({
        urls: {
            A1: "A1.mp3",
            A2: "A2.mp3"
        },
        baseUrl: "https://tonejs.github.io/audio/casio/"
    });

    const delay = new Tone.PingPongDelay({
        delayTime: "8n",
        feedback: 0.5,
        wet: 0.1
    });

    const reverb = new Tone.Reverb({
        decay: 1,
        wet: 0.7
    });

    sampler.chain(delay, reverb, Tone.Destination);

    $('#github-username').val('')

    $('#start-button').on('click', (e) => {
            e.preventDefault();
            let usernameInput = $('#github-username').val().trim();
            // if the chords array is already populated
            if (chords.length > 0) {
                // and the username input hasn't changed
                if (username === usernameInput) {
                    // unpause the transport
                    Tone.Transport.start();
                    // if the username input HAS changed, 
                    // cancel all transport events and empty chords array
                    // then scrape data for new username input
                } else {
                    Tone.Transport.cancel(after = 0);
                    Tone.Transport.stop();
                    chords = [];
                    githubScrape(usernameInput);
                    username = usernameInput;
                }
                // if the chords array is empty, scrape the contribution graphs
                // for the github user with the indicated username    
            } else {
                githubScrape(usernameInput);
                username = usernameInput;
            }
        }) //end start-button handler

    $('#stop-button').on('click', (e) => {
            e.preventDefault();
            Tone.Transport.pause();
        }) //end start-button handler

    // scrape github page w/ request and cheerio
    // returns a JSON object with data count values for each cell in contribution graph
    // grouped into weeks
    const githubScrape = (username) => {
            $.get('/scrape/' + username, (data) => {
                if (jQuery.isEmptyObject(data)) {
                    $('#contribution-graph').text("Not a valid GitHub username");
                } else {
                    $('#contribution-graph').empty();
                    buildChords(data);
                }
            })
        } //end gitgubScrape

    // iterate through scraped data, associating each day
    // with a note value from notes array. Group note values into "chords" for each week
    // push each chord into chords array 
    const buildChords = (data) => {
            for (let key in data) {
                let weeklyData = data[key];
                let chord = [];
                for (let i = 0; i < weeklyData.length; i++) {
                    let val = weeklyData[i];
                    if (val < 30) {
                        let note = notes[val];
                        chord.push(note);
                    } else {
                        chord.push("C6")
                    }
                }
                chords.push(chord);
            }
            playScrape(chords);
        } //end buildChords

    // create a new Tone.Loop object that repeats every measure
    // each time through the loop, access the next chord and use a
    // Tone.Pattern object to play each note from the chord individually
    const playScrape = (chords) => {
            let i = 0;
            loop = new Tone.Loop((time) => {
                let chord = chords[i];
                if (chord.length > 1) {
                    pattern = new Tone.Pattern(function(time, note) {
                        let vel = (Math.random() * (1 - 0.6) + 0.6).toFixed(2);
                        renderGraph(note);
                        sampler.triggerAttackRelease(note, "4n", time, vel);
                    }, chord, "up");
                    pattern.interval = "16n";
                    pattern.humanize = "64n";
                    pattern.iterations = 7;
                    pattern.start();
                    i++;
                }
            }, "1n").start(0);
            Tone.Transport.bpm.value = 100;
            Tone.Transport.start();
        } //end playScrape

    function renderGraph(note) {
        var el = $("<div>&nbsp;</div>").attr("class", note);
        $("#contribution-graph").append(el);
    }
});