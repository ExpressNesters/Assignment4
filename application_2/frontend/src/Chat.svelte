<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let input = '';
    let usernameInput = '';
    const messagesStore = writable([]);
    const usernameStore = writable('');
    let socket;

    function setUsername() {
        usernameStore.set(usernameInput);
    }

    onMount(async () => {
        const res = await fetch('http://localhost:5000/get_messages');
        const initialMessages = await res.json();
        messagesStore.set(initialMessages);

        if (window.location.protocol === 'https:') {
            socket = new WebSocket(`wss://localhost:5000/ws`);
        } else {
            socket = new WebSocket(`ws://localhost:5000/ws`);
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            messagesStore.update(currentMessages => [...currentMessages, message]);
        };
    });

    function sendMessage() {
        if (input.trim() === '') return;
        const message = { user: $usernameStore, text: input };
        socket.send(JSON.stringify(message));
        input = ''; // Clear input after sending
    }
</script>

<style>
    .chat {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        font-family: Arial, sans-serif;
    }

    .message {
        margin: 10px 0;
        padding: 10px;
        border-radius: 8px;
    }

    .message.me {
        text-align: right;
    }

    .message-content {
        padding: 5px;
        display: inline-block;
        border-radius: 8px;
    }

    .message.me .message-content {
        background-color: #e1fcef;
    }

    .message.other .message-content {
        background-color: #f2e4d9;
    }

    .input-area {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    input {
        flex: 1;
        padding: 10px;
        margin-right: 10px;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    button {
        padding: 10px 15px;
        border: none;
        border-radius: 8px;
        background-color: #007BFF;
        color: #fff;
        cursor: pointer;
    }

    .username-prompt {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .username-box {
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        width: 300px;
        text-align: center;
    }
</style>

{#if $usernameStore === ''}
    <div class="username-prompt">
        <div class="username-box">
            <h2>Welcome</h2>
            <p>Please enter your name:</p>
            <input bind:value={usernameInput} type="text" placeholder="Your name" />
            <button on:click={setUsername}>Start Chatting</button>
        </div>
    </div>
{:else}
    <div class="chat">
        {#each $messagesStore as message, index (index)}
            <div class={`message ${message.user === $usernameStore ? 'me' : 'other'}`}>
                <div class="message-content">
                    <strong>{message.user}:</strong> {message.text}
                </div>
            </div>
        {/each}

        <div class="input-area">
            <input bind:value={input} type="text" placeholder="Type a message..." />
            <button on:click={sendMessage}>Send</button>
        </div>
    </div>
{/if}
