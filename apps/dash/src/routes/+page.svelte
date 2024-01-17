<script lang="ts">
	import { Turnstile } from "$lib";
	// import { TURNSTILE_KEY } from "$env/static/public";
	let submitButton: HTMLButtonElement;
</script>

<div class="flex flex-col items-center justify-center h-fit min-h-[95vh]">
	<form action="/login" class="px-10 py-7 max-w-[75%] mb-10 flex flex-col gap-y-4" method="POST">
		<h1 class="text-center text-white font-bold text-8xl my-5">Corsica</h1>
		<p class="text-center italic text-white">
			Free hosted caching for your <a
				class=" text-sky-600"
				href="https://turbo.build/repo"
				target="_blank">Turborepo</a
			> projects.
		</p>
		<label for="email" class="text-white block text-center">Email Address</label>
		<input type="email" class="mx-auto w-7/10" name="email" required />
		<!-- <Turnstile
			class="m-auto"
			siteKey={TURNSTILE_KEY}
			theme="dark"
			on:turnstile-callback={() => (submitButton.disabled = false)}
			on:turnstile-error={() => (submitButton.disabled = true)}
			on:turnstile-expired={() => (submitButton.disabled = true)}
			on:turnstile-timeout={() => (submitButton.disabled = true)}
		/> -->
		<button
			class="my-5 block text-center bg-sky-500 disabled:bg-sky-700 disabled:cursor-default w-full px-6 py-3 rounded-md"
			bind:this={submitButton}
			disabled>Log In</button
		>
	</form>
</div>
